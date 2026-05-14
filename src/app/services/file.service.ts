import { Injectable } from '@angular/core';

// SPW3 binary layout (168-byte fixed header):
// Bytes   0-3:   "SPW3" magic
// Bytes   4-19:  password_salt (16 bytes)
// Bytes  20-31:  password_iv   (12 bytes)
// Bytes  32-47:  recovery_salt (16 bytes)
// Bytes  48-59:  recovery_iv   (12 bytes)
// Bytes  60-107: master_key wrapped with password key (48 = 32 key + 16 GCM tag)
// Bytes 108-155: master_key wrapped with recovery key (48 bytes)
// Bytes 156-167: data_iv (12 bytes)
// Bytes 168+:    AES-GCM encrypted JSON payload

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly MAGIC_HEADER_V1 = 'SPW1';
  private readonly MAGIC_HEADER_V2 = 'SPW2';
  private readonly MAGIC_HEADER_V3 = 'SPW3';
  private readonly XOR_KEY = 0x53; // 'S' for Sparrow
  private readonly PBKDF2_ITERATIONS = 100000;

  // ── SPW1 / SPW2 ──────────────────────────────────────────────────────────────

  async parseSpwFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);

          const decoder = new TextDecoder('ascii');
          const header = decoder.decode(bytes.slice(0, 4));

          let jsonString = '';

          if (header === this.MAGIC_HEADER_V2) {
            const payload = bytes.slice(4);
            for (let i = 0; i < payload.length; i++) {
              payload[i] ^= this.XOR_KEY;
            }
            jsonString = new TextDecoder('utf-8').decode(payload);
          } else if (header === this.MAGIC_HEADER_V1) {
            jsonString = new TextDecoder('utf-8').decode(bytes.slice(4));
          } else {
            reject(new Error('Invalid .spw file format (magic header missing).'));
            return;
          }

          const state = JSON.parse(jsonString);
          resolve(state);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  exportSpwFile(state: any, filename: string = 'data.spw'): void {
    try {
      const jsonString = JSON.stringify(state);
      const payloadBytes = new TextEncoder().encode(jsonString);

      for (let i = 0; i < payloadBytes.length; i++) {
        payloadBytes[i] ^= this.XOR_KEY;
      }

      const headerBytes = new TextEncoder().encode(this.MAGIC_HEADER_V2);
      const fileBytes = new Uint8Array(headerBytes.length + payloadBytes.length);
      fileBytes.set(headerBytes, 0);
      fileBytes.set(payloadBytes, headerBytes.length);

      this.triggerDownload(fileBytes, filename);
    } catch (error) {
      console.error('Error exporting .spw file', error);
      throw error;
    }
  }

  // ── SPW3 (AES-GCM encrypted) ─────────────────────────────────────────────────

  /** Returns true if the file uses the SPW3 password-protected format. */
  async isSpw3File(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const header = new TextDecoder('ascii').decode(new Uint8Array(buffer));
          resolve(header === this.MAGIC_HEADER_V3);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  /**
   * Export a password-protected SPW3 file.
   * Returns the generated recovery key so it can be shown to the user.
   */
  async exportSpwFileEncrypted(state: any, password: string, filename: string = 'data.spw'): Promise<{ recoveryKey: string }> {
    const recoveryKey = this.generateRecoveryKey();
    await this.exportSpwFileEncryptedWithRecovery(state, password, recoveryKey, filename);
    return { recoveryKey };
  }

  /**
   * Export using a caller-supplied recovery key (used when re-exporting after setup
   * so the shown recovery key matches what's baked into the file).
   */
  async exportSpwFileEncryptedWithRecovery(
    state: any,
    password: string,
    recoveryKey: string,
    filename: string = 'data.spw'
  ): Promise<void> {

    // Random keying material
    const masterKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    const passwordSalt   = crypto.getRandomValues(new Uint8Array(16));
    const passwordIv     = crypto.getRandomValues(new Uint8Array(12));
    const recoverySalt   = crypto.getRandomValues(new Uint8Array(16));
    const recoveryIv     = crypto.getRandomValues(new Uint8Array(12));
    const dataIv         = crypto.getRandomValues(new Uint8Array(12));

    // Derive wrapping keys
    const passwordKey  = await this.deriveKey(password, passwordSalt);
    const recoveryKeyD = await this.deriveKey(recoveryKey, recoverySalt);

    // Wrap the master key with both
    const wrappedByPassword = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: passwordIv }, passwordKey, masterKeyBytes
    ));
    const wrappedByRecovery = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: recoveryIv }, recoveryKeyD, masterKeyBytes
    ));

    // Encrypt the payload with the master key
    const masterCryptoKey = await crypto.subtle.importKey(
      'raw', masterKeyBytes, { name: 'AES-GCM' }, false, ['encrypt']
    );
    const payloadBytes       = new TextEncoder().encode(JSON.stringify(state));
    const encryptedPayload   = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: dataIv }, masterCryptoKey, payloadBytes
    ));

    // Assemble: 4 + 16 + 12 + 16 + 12 + 48 + 48 + 12 = 168-byte header
    const magic      = new TextEncoder().encode(this.MAGIC_HEADER_V3);
    const fileBytes  = new Uint8Array(168 + encryptedPayload.byteLength);
    let off = 0;
    fileBytes.set(magic,             off); off += 4;
    fileBytes.set(passwordSalt,      off); off += 16;
    fileBytes.set(passwordIv,        off); off += 12;
    fileBytes.set(recoverySalt,      off); off += 16;
    fileBytes.set(recoveryIv,        off); off += 12;
    fileBytes.set(wrappedByPassword, off); off += 48;
    fileBytes.set(wrappedByRecovery, off); off += 48;
    fileBytes.set(dataIv,            off); off += 12;
    fileBytes.set(encryptedPayload,  off);

    this.triggerDownload(fileBytes, filename);
  }

  /**
   * Parse a password-protected SPW3 file.
   * @param credential  The password or recovery key entered by the user.
   * @param isRecovery  True when `credential` is a recovery key.
   */
  async parseSpw3File(file: File, credential: string, isRecovery: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const bytes  = new Uint8Array(buffer);

          const header = new TextDecoder('ascii').decode(bytes.slice(0, 4));
          if (header !== this.MAGIC_HEADER_V3) {
            reject(new Error('Not a password-protected file.'));
            return;
          }

          let off = 4;
          const passwordSalt      = bytes.slice(off, off + 16); off += 16;
          const passwordIv        = bytes.slice(off, off + 12); off += 12;
          const recoverySalt      = bytes.slice(off, off + 16); off += 16;
          const recoveryIv        = bytes.slice(off, off + 12); off += 12;
          const wrappedByPassword = bytes.slice(off, off + 48); off += 48;
          const wrappedByRecovery = bytes.slice(off, off + 48); off += 48;
          const dataIv            = bytes.slice(off, off + 12); off += 12;
          const encryptedPayload  = bytes.slice(off);

          const salt    = isRecovery ? recoverySalt      : passwordSalt;
          const iv      = isRecovery ? recoveryIv        : passwordIv;
          const wrapped = isRecovery ? wrappedByRecovery : wrappedByPassword;

          const derivedKey = await this.deriveKey(credential, salt);

          let masterKeyBytes: ArrayBuffer;
          try {
            masterKeyBytes = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv }, derivedKey, wrapped
            );
          } catch {
            reject(new Error('Incorrect password or recovery key.'));
            return;
          }

          const masterCryptoKey = await crypto.subtle.importKey(
            'raw', masterKeyBytes, { name: 'AES-GCM' }, false, ['decrypt']
          );

          let decryptedPayload: ArrayBuffer;
          try {
            decryptedPayload = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: dataIv }, masterCryptoKey, encryptedPayload
            );
          } catch {
            reject(new Error('Data decryption failed.'));
            return;
          }

          const state = JSON.parse(new TextDecoder('utf-8').decode(decryptedPayload));
          resolve(state);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private generateRecoveryKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const raw   = Array.from(bytes).map(b => chars[b % chars.length]).join('');
    // Format as XXXXXX-XXXXXX-XXXXXX
    return `${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12, 18)}`;
  }

  private triggerDownload(bytes: Uint8Array, filename: string): void {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
