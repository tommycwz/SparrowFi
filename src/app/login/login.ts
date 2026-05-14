import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isDragging = false;
  errorMessage = '';

  // Password prompt state
  showPasswordPrompt = false;
  useRecovery = false;
  passwordInput = '';
  passwordError = '';
  isDecrypting = false;
  private pendingFile: File | null = null;

  constructor(
    private router: Router,
    private stateService: StateService,
    private fileService: FileService
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.errorMessage = '';

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.handleFile(files[0]);
    }
  }

  async onFileSelected(event: Event) {
    this.errorMessage = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.handleFile(input.files[0]);
    }
  }

  private async handleFile(file: File) {
    if (!file.name.endsWith('.spw')) {
      this.errorMessage = 'Please provide a valid .spw file.';
      return;
    }

    const isEncrypted = await this.fileService.isSpw3File(file);
    if (isEncrypted) {
      this.pendingFile = file;
      this.passwordInput = '';
      this.passwordError = '';
      this.useRecovery = false;
      this.showPasswordPrompt = true;
      return;
    }

    try {
      const state = await this.fileService.parseSpwFile(file);
      this.stateService.setState(state);
      this.stateService.setLoadedFilename(file.name);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage = e.message || 'Failed to load file.';
    }
  }

  async submitPassword() {
    if (!this.pendingFile || !this.passwordInput.trim()) return;

    this.isDecrypting = true;
    this.passwordError = '';

    try {
      const state = await this.fileService.parseSpw3File(
        this.pendingFile,
        this.passwordInput.trim(),
        this.useRecovery
      );
      this.stateService.setState(state);
      this.stateService.setFilePassword(this.useRecovery ? null : this.passwordInput.trim());
      this.stateService.setLoadedFilename(this.pendingFile!.name);
      this.showPasswordPrompt = false;
      this.pendingFile = null;
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.passwordError = e.message || 'Decryption failed.';
    } finally {
      this.isDecrypting = false;
    }
  }

  toggleRecoveryMode() {
    this.useRecovery = !this.useRecovery;
    this.passwordInput = '';
    this.passwordError = '';
  }

  cancelPasswordPrompt() {
    this.showPasswordPrompt = false;
    this.pendingFile = null;
    this.passwordInput = '';
    this.passwordError = '';
  }

  startNewUser() {
    this.stateService.startNewUser();
    this.router.navigate(['/dashboard']);
  }
}
