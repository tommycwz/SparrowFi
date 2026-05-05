import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isDragging = false;
  errorMessage = '';

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

    try {
      const state = await this.fileService.parseSpwFile(file);
      this.stateService.setState(state);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage = e.message || 'Failed to load file.';
    }
  }

  startNewUser() {
    this.stateService.startNewUser();
    this.router.navigate(['/dashboard']);
  }
}
