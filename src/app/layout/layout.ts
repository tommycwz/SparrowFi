import { Component, HostListener, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  isCollapsed = signal(false);

  readonly exportLabel = computed(() => this.stateService.loadedFilename() ?? 'new_save.spw');

  constructor(
    public stateService: StateService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateCollapsedState();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCollapsedState();
  }

  private updateCollapsedState() {
    // Auto-collapse on viewports narrower than 900px
    if (window.innerWidth < 900) {
      this.isCollapsed.set(true);
    } else {
      this.isCollapsed.set(false);
    }
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  async exportData() {
    const state    = this.stateService.state();
    const password = this.stateService.filePassword();
    const filename = this.stateService.loadedFilename() ?? 'new_save.spw';

    if (state.settings?.passwordEnabled && password) {
      await this.fileService.exportSpwFileEncrypted(state, password, filename);
    } else {
      this.fileService.exportSpwFile(state, filename);
    }
    this.stateService.markClean();
  }

  async logout() {
    if (this.stateService.isDirty()) {
      const confirmExport = confirm('You have unsaved changes. Do you want to export before logging out?');
      if (confirmExport) {
        await this.exportData();
        return;
      }
    }
    this.stateService.logout();
    this.router.navigate(['/login']);
  }
}
