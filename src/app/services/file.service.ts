import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly MAGIC_HEADER_V1 = 'SPW1';
  private readonly MAGIC_HEADER_V2 = 'SPW2';
  private readonly XOR_KEY = 0x53; // 'S' for Sparrow

  async parseSpwFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          
          // Check header
          const decoder = new TextDecoder('ascii');
          const header = decoder.decode(bytes.slice(0, 4));
          
          let jsonString = '';
          
          if (header === this.MAGIC_HEADER_V2) {
            // SPW2: XOR Obfuscated
            const payload = bytes.slice(4);
            for (let i = 0; i < payload.length; i++) {
              payload[i] ^= this.XOR_KEY;
            }
            const utf8Decoder = new TextDecoder('utf-8');
            jsonString = utf8Decoder.decode(payload);
          } else if (header === this.MAGIC_HEADER_V1) {
            // SPW1: Plain JSON
            const utf8Decoder = new TextDecoder('utf-8');
            jsonString = utf8Decoder.decode(bytes.slice(4));
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
      const encoder = new TextEncoder();
      const payloadBytes = encoder.encode(jsonString);
      
      // Obfuscate with XOR
      for (let i = 0; i < payloadBytes.length; i++) {
        payloadBytes[i] ^= this.XOR_KEY;
      }
      
      const headerBytes = new TextEncoder().encode(this.MAGIC_HEADER_V2);
      
      const fileBytes = new Uint8Array(headerBytes.length + payloadBytes.length);
      fileBytes.set(headerBytes, 0);
      fileBytes.set(payloadBytes, headerBytes.length);

      const blob = new Blob([fileBytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting .spw file', error);
      throw error;
    }
  }
}
