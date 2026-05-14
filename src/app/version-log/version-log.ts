import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import packageInfo from '../../../package.json';

interface VersionEntry {
  version: string;
  date: string;
  tag?: 'latest' | 'initial';
  changes: { type: 'new' | 'fix' | 'improve' | 'security'; text: string }[];
}

@Component({
  selector: 'app-version-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './version-log.html',
  styleUrls: ['./version-log.scss']
})
export class VersionLogComponent {
  currentVersion = packageInfo.version;

  entries: VersionEntry[] = [
    {
      version: '1.0.0',
      date: '14 May 2026',
      tag: 'latest',
      changes: [
        { type: 'new', text: 'Initial public release of SparrowFi' },
        { type: 'new', text: 'Offline-first .spw binary file format (SPW2)' },
        { type: 'new', text: 'Dashboard with net worth, income & expense overview' },
        { type: 'new', text: 'Banks, Wallets, Cards, Categories management' },
        { type: 'new', text: 'Transaction ledger with full CRUD' },
        { type: 'new', text: 'Fixed Deposit tracker with maturity calculation' },
        { type: 'new', text: 'Reports page with charts and summaries' },
        { type: 'new', text: 'Multi-currency support (MYR, USD, EUR, GBP, SGD, AUD)' },
        { type: 'security', text: 'Added password protection for .spw files (SPW3)' },
        { type: 'security', text: 'Recovery key system — no server, no data leaves your device' },
      ]
    }
  ];

  typeLabel(type: string): string {
    switch (type) {
      case 'new':      return 'New';
      case 'fix':      return 'Fix';
      case 'improve':  return 'Improve';
      case 'security': return 'Security';
      default:         return type;
    }
  }
}
