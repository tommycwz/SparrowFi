import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent {
  currencies = [
    { code: 'myr', label: 'MYR - Malaysian Ringgit (RM)' },
    { code: 'usd', label: 'USD - US Dollar ($)' },
    { code: 'eur', label: 'EUR - Euro (€)' },
    { code: 'gbp', label: 'GBP - British Pound (£)' },
    { code: 'sgd', label: 'SGD - Singapore Dollar (S$)' },
    { code: 'aud', label: 'AUD - Australian Dollar (A$)' }
  ];

  selectedCurrency: string;

  constructor(public stateService: StateService) {
    this.selectedCurrency = this.stateService.state().settings?.currency || 'myr';
  }

  saveSettings() {
    this.stateService.updateSettings({ currency: this.selectedCurrency });
  }
}
