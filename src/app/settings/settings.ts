import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StateService } from '../services/state.service';
import { FileService } from '../services/file.service';
import packageInfo from '../../../package.json';

type PasswordModalStep = 'setup' | 'recovery' | null;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent {
  version = packageInfo.version;
  currencies = [
    { code: 'myr', label: 'MYR - Malaysian Ringgit (RM)' },
    { code: 'usd', label: 'USD - US Dollar ($)' },
    { code: 'eur', label: 'EUR - Euro (€)' },
    { code: 'gbp', label: 'GBP - British Pound (£)' },
    { code: 'sgd', label: 'SGD - Singapore Dollar (S$)' },
    { code: 'aud', label: 'AUD - Australian Dollar (A$)' }
  ];

  selectedCurrency: string;

  // Password section
  readonly passwordEnabled = computed(() => !!this.stateService.state().settings?.passwordEnabled);
  passwordModalStep = signal<PasswordModalStep>(null);
  passwordInput = '';
  passwordConfirm = '';
  passwordError = '';
  generatedRecoveryKey = '';
  recoveryConfirmed = false;
  isProcessing = false;

  constructor(
    public stateService: StateService,
    private fileService: FileService
  ) {
    this.selectedCurrency = this.stateService.state().settings?.currency || 'myr';
  }

  saveSettings() {
    const current = this.stateService.state().settings;
    this.stateService.updateSettings({ ...current, currency: this.selectedCurrency });
  }

  // ── Password enable / disable ────────────────────────────────────────────────

  onPasswordToggle() {
    if (this.passwordEnabled()) {
      this.disablePassword();
    } else {
      this.openSetupModal();
    }
  }

  openSetupModal() {
    this.passwordInput = '';
    this.passwordConfirm = '';
    this.passwordError = '';
    this.recoveryConfirmed = false;
    this.passwordModalStep.set('setup');
  }

  closePasswordModal() {
    this.passwordModalStep.set(null);
    this.passwordInput = '';
    this.passwordConfirm = '';
    this.passwordError = '';
    this.generatedRecoveryKey = '';
    this.recoveryConfirmed = false;
    this.isProcessing = false;
  }

  async confirmPasswordSetup() {
    this.passwordError = '';

    if (this.passwordInput.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
      return;
    }
    if (this.passwordInput !== this.passwordConfirm) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    this.isProcessing = true;
    try {
      // Do a trial export to generate the recovery key (we get it back without saving yet)
      // We need the key before committing. Generate it by calling the service method.
      // Since we can't call exportSpwFileEncrypted without triggering download,
      // we generate a recovery key inline here using the same algorithm.
      this.generatedRecoveryKey = this.generateRecoveryKey();
      this.passwordModalStep.set('recovery');
    } finally {
      this.isProcessing = false;
    }
  }

  async finalizePasswordEnable() {
    if (!this.recoveryConfirmed) {
      this.passwordError = 'Please confirm you have saved the recovery key.';
      return;
    }

    this.isProcessing = true;
    try {
      const currentSettings = this.stateService.state().settings;
      this.stateService.updateSettings({ ...currentSettings, passwordEnabled: true });
      this.stateService.setFilePassword(this.passwordInput);

      // Export immediately with the new password so the file is protected right away
      const state = this.stateService.state();
      // We need to use the pre-generated recovery key — pass it via a special param.
      // Re-export using an overload that accepts the recovery key directly.
      await this.fileService.exportSpwFileEncryptedWithRecovery(
        state,
        this.passwordInput,
        this.generatedRecoveryKey
      );
      this.stateService.markClean();
      this.closePasswordModal();
    } finally {
      this.isProcessing = false;
    }
  }

  disablePassword() {
    const ok = confirm(
      'Disable password protection?\n\n' +
      'Your next export will be saved without encryption. ' +
      'Anyone who obtains the file will be able to read it.'
    );
    if (!ok) return;

    const currentSettings = this.stateService.state().settings;
    this.stateService.updateSettings({ ...currentSettings, passwordEnabled: false });
    this.stateService.setFilePassword(null);
  }

  private generateRecoveryKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const raw = Array.from(bytes).map(b => chars[b % chars.length]).join('');
    return `${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12, 18)}`;
  }
}
