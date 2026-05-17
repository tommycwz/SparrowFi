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
      version: '1.2.0',
      date: '17 May 2026',
      tag: 'latest',
      changes: [
        { type: 'new', text: 'Added Monthly Recurring transaction scheduling module' },
        { type: 'new', text: 'Auto-generation trigger supporting month offset date adjustments' },
        { type: 'new', text: 'Daily active recurring schedule auto-triggering on .spw file load' },
        { type: 'new', text: 'Stunning custom 3-way logout confirmation dialog (Save, Discard, Cancel)' },
        { type: 'improve', text: 'Double-trigger lookahead safeguard checking date, category, and remarks' },
        { type: 'improve', text: 'Interactive progress bar indicating monthly trigger completions' },
        { type: 'improve', text: 'Integrated Category selection filters matching Income, Expense, Other In, and Other Out' },
        { type: 'improve', text: 'Clean absolute-positioned Unsaved notification badge overlaying the Export button' }
      ]
    },
    {
      version: '1.1.0',
      date: '17 May 2026',
      changes: [
        { type: 'improve', text: 'Overhauled financial reports featuring Chart.js interactive category breakdown doughnut charts' },
        { type: 'improve', text: 'Added Annual month-on-month trend grouped bar charts comparing Income vs Expenses' },
        { type: 'improve', text: 'Integrated dynamic percentages and category progress bars in Monthly/Annual breakdown sheets' },
        { type: 'improve', text: 'Fully responsive UI layouts for mobile/tablet screen sizes across all modules' },
        { type: 'improve', text: 'Centered pop-up modals for new transaction entries' },
        { type: 'fix', text: 'Fixed transaction time display formats (12-hour AM/PM)' },
        { type: 'fix', text: 'Added Auto-Capture controls for transaction timestamps' }
      ]
    },
    {
      version: '1.0.0',
      date: '14 May 2026',
      tag: 'initial',
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
      case 'new': return 'New';
      case 'fix': return 'Fix';
      case 'improve': return 'Improve';
      case 'security': return 'Security';
      default: return type;
    }
  }
}
