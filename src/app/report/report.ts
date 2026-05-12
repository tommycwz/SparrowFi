import { Component, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Transaction } from '../services/state.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.html',
  styleUrls: ['./report.scss'],
  providers: [DecimalPipe]
})
export class ReportComponent {
  
  // Format: "YYYY-MM"
  selectedMonth = new Date().toISOString().slice(0, 7);
  selectedYear = new Date().getFullYear();

  constructor(public stateService: StateService) {}

  generateReport(format: 'html' | 'csv') {
    if (!this.selectedMonth) {
      alert("Please select a month and year.");
      return;
    }

    const state = this.stateService.state();
    const transactions = state.transactions || [];
    
    // 1. Filter transactions for the selected month
    const yearMonth = this.selectedMonth; // "2026-05"
    const monthTransactions = transactions.filter(t => t.date.startsWith(yearMonth));

    // Calculate Income by Category
    const incomeCategories: { [id: string]: number } = {};
    let totalIncome = 0;
    
    // Calculate Expenses by Category
    const expenseCategories: { [id: string]: number } = {};
    let totalExpense = 0;

    for (const t of monthTransactions) {
      if (t.type === 'income') {
        incomeCategories[t.categoryId] = (incomeCategories[t.categoryId] || 0) + t.amount;
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        expenseCategories[t.categoryId] = (expenseCategories[t.categoryId] || 0) + t.amount;
        totalExpense += t.amount;
      }
    }

    // 2. Calculate Current Balances (Overall)
    // For Banks and Wallets, we look at all transactions up to now (or just use current balance logic)
    // We will just calculate current balance from all transactions for simplicity as requested.
    
    const bankBalances: { [id: string]: number } = {};
    const walletBalances: { [id: string]: number } = {};
    
    for (const b of state.banks) bankBalances[b.id] = 0;
    for (const w of (state.wallets || [])) walletBalances[w.id] = 0;

    for (const t of transactions) {
      if (t.accountType === 'bank' && bankBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') bankBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') bankBalances[t.accountId] -= t.amount;
      }
      if (t.accountType === 'wallet' && walletBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') walletBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') walletBalances[t.accountId] -= t.amount;
      }
    }

    // 3. Build Content based on format
    if (format === 'csv') {
      let csv = [];
      csv.push(`Monthly Financial Report,${yearMonth}`);
      csv.push(``);

      csv.push(`INCOME`);
      csv.push(`Category,Amount`);
      for (const catId of Object.keys(incomeCategories)) {
        csv.push(`"${this.getCategoryName(catId)}",${incomeCategories[catId].toFixed(2)}`);
      }
      csv.push(`"TOTAL INCOME",${totalIncome.toFixed(2)}`);
      csv.push(``);

      csv.push(`EXPENSES`);
      csv.push(`Category,Amount`);
      for (const catId of Object.keys(expenseCategories)) {
        csv.push(`"${this.getCategoryName(catId)}",${expenseCategories[catId].toFixed(2)}`);
      }
      csv.push(`"TOTAL EXPENSES",${totalExpense.toFixed(2)}`);
      csv.push(``);
      
      csv.push(`"NET CASH FLOW",${(totalIncome - totalExpense).toFixed(2)}`);
      csv.push(``);
      csv.push(``);

      csv.push(`CURRENT ASSET BALANCES`);
      csv.push(``);

      csv.push(`Banks`);
      csv.push(`Account Name,Balance`);
      let totalBanks = 0;
      for (const bank of state.banks) {
        csv.push(`"${bank.name}",${bankBalances[bank.id].toFixed(2)}`);
        totalBanks += bankBalances[bank.id];
      }
      csv.push(`"Total Bank Capital",${totalBanks.toFixed(2)}`);
      csv.push(``);

      csv.push(`Wallets`);
      csv.push(`Account Name,Balance`);
      let totalWallets = 0;
      for (const wallet of (state.wallets || [])) {
        csv.push(`"${wallet.name}",${walletBalances[wallet.id].toFixed(2)}`);
        totalWallets += walletBalances[wallet.id];
      }
      csv.push(`"Total Wallet Capital",${totalWallets.toFixed(2)}`);
      csv.push(``);

      csv.push(`Fixed Deposits (Active)`);
      csv.push(`Bank,Principal,Maturity Date`);
      let totalFD = 0;
      const activeFDs = (state.fixedDeposits || []).filter(fd => fd.status === 'active');
      for (const fd of activeFDs) {
        csv.push(`"${this.getBankName(fd.bankId)}",${fd.amount.toFixed(2)},${this.getMaturityDate(fd).toISOString().split('T')[0]}`);
        totalFD += fd.amount;
      }
      csv.push(`"Total Active FDs",${totalFD.toFixed(2)}`);

      this.downloadFile(csv.join('\n'), `Financial_Report_${yearMonth}.csv`, 'text/csv;charset=utf-8;');
    } else {
      // HTML format
      const curr = this.stateService.currencySymbol();
      const formatCurrency = (val: number) => `${curr}${val.toFixed(2)}`;
      
      let html = this.getHtmlTemplate(`Monthly Financial Report - ${yearMonth}`);
      
      html += `
        <div class="header">
          <h1>Monthly Financial Report</h1>
          <p>For the period of <strong>${yearMonth}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${formatCurrency(totalExpense)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${totalIncome >= totalExpense ? 'success' : 'danger'}">${formatCurrency(totalIncome - totalExpense)}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Income Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(incomeCategories).map(catId => `<tr><td>${this.getCategoryName(catId)}</td><td class="right">${formatCurrency(incomeCategories[catId])}</td></tr>`).join('')}
              <tr class="total-row"><td>Total</td><td class="right">${formatCurrency(totalIncome)}</td></tr>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expense Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(expenseCategories).map(catId => `<tr><td>${this.getCategoryName(catId)}</td><td class="right">${formatCurrency(expenseCategories[catId])}</td></tr>`).join('')}
              <tr class="total-row"><td>Total</td><td class="right">${formatCurrency(totalExpense)}</td></tr>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 2rem;">Current Asset Balances</h2>
        <div class="grid">
          <div>
            <h3>Banks</h3>
            <table>
              <tr><th>Account Name</th><th class="right">Balance</th></tr>
              ${state.banks.map(bank => `<tr><td>${bank.name}</td><td class="right">${formatCurrency(bankBalances[bank.id])}</td></tr>`).join('')}
            </table>
          </div>
          <div>
            <h3>Wallets & Fixed Deposits</h3>
            <table>
              <tr><th>Wallet Name</th><th class="right">Balance</th></tr>
              ${(state.wallets || []).map(wallet => `<tr><td>${wallet.name}</td><td class="right">${formatCurrency(walletBalances[wallet.id])}</td></tr>`).join('')}
            </table>
            <br>
            <table>
              <tr><th>Active FD Bank</th><th class="right">Principal</th></tr>
              ${(state.fixedDeposits || []).filter(fd => fd.status === 'active').map(fd => `<tr><td>${this.getBankName(fd.bankId)}</td><td class="right">${formatCurrency(fd.amount)}</td></tr>`).join('')}
            </table>
          </div>
        </div>
      </body>
      </html>`;

      this.downloadFile(html, `Financial_Report_${yearMonth}.html`, 'text/html;charset=utf-8;');
    }
  }

  generateAnnualReport(format: 'html' | 'csv') {
    if (!this.selectedYear) {
      alert("Please select a year.");
      return;
    }

    const yearStr = this.selectedYear.toString();
    const state = this.stateService.state();
    const transactions = state.transactions || [];
    
    // Filter transactions for the selected year
    const yearTransactions = transactions.filter(t => t.date.startsWith(yearStr));

    // Calculate Income by Category
    const incomeCategories: { [id: string]: number } = {};
    let totalIncome = 0;
    
    // Calculate Expenses by Category
    const expenseCategories: { [id: string]: number } = {};
    let totalExpense = 0;

    for (const t of yearTransactions) {
      if (t.type === 'income') {
        incomeCategories[t.categoryId] = (incomeCategories[t.categoryId] || 0) + t.amount;
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        expenseCategories[t.categoryId] = (expenseCategories[t.categoryId] || 0) + t.amount;
        totalExpense += t.amount;
      }
    }

    if (format === 'csv') {
      let csv = [];
      csv.push(`Annual Summary Report,${yearStr}`);
      csv.push(``);

      csv.push(`INCOME`);
      csv.push(`Category,Amount`);
      for (const catId of Object.keys(incomeCategories)) {
        csv.push(`"${this.getCategoryName(catId)}",${incomeCategories[catId].toFixed(2)}`);
      }
      csv.push(`"TOTAL INCOME",${totalIncome.toFixed(2)}`);
      csv.push(``);

      csv.push(`EXPENSES`);
      csv.push(`Category,Amount`);
      for (const catId of Object.keys(expenseCategories)) {
        csv.push(`"${this.getCategoryName(catId)}",${expenseCategories[catId].toFixed(2)}`);
      }
      csv.push(`"TOTAL EXPENSES",${totalExpense.toFixed(2)}`);
      csv.push(``);
      
      csv.push(`"NET CASH FLOW",${(totalIncome - totalExpense).toFixed(2)}`);

      this.downloadFile(csv.join('\n'), `Annual_Summary_${yearStr}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const curr = this.stateService.currencySymbol();
      const formatCurrency = (val: number) => `${curr}${val.toFixed(2)}`;
      
      let html = this.getHtmlTemplate(`Annual Summary - ${yearStr}`);
      
      html += `
        <div class="header">
          <h1>Annual Financial Summary</h1>
          <p>For the year of <strong>${yearStr}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${formatCurrency(totalExpense)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${totalIncome >= totalExpense ? 'success' : 'danger'}">${formatCurrency(totalIncome - totalExpense)}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Annual Income Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(incomeCategories).map(catId => `<tr><td>${this.getCategoryName(catId)}</td><td class="right">${formatCurrency(incomeCategories[catId])}</td></tr>`).join('')}
              <tr class="total-row"><td>Total</td><td class="right">${formatCurrency(totalIncome)}</td></tr>
            </table>
          </div>
          <div>
            <h2 class="section-title">Annual Expense Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(expenseCategories).map(catId => `<tr><td>${this.getCategoryName(catId)}</td><td class="right">${formatCurrency(expenseCategories[catId])}</td></tr>`).join('')}
              <tr class="total-row"><td>Total</td><td class="right">${formatCurrency(totalExpense)}</td></tr>
            </table>
          </div>
        </div>
      </body>
      </html>`;

      this.downloadFile(html, `Annual_Summary_${yearStr}.html`, 'text/html;charset=utf-8;');
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private getHtmlTemplate(title: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --primary: #3b82f6;
      --success: #22c55e;
      --danger: #ef4444;
    }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .header h1 {
      margin: 0;
      color: var(--primary);
      font-size: 2.5rem;
    }
    .header p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    .card.highlight {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }
    .card h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-muted);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card .amount {
      font-size: 2rem;
      font-weight: bold;
    }
    .amount.success { color: var(--success); }
    .amount.danger { color: var(--danger); }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
    }
    .section-title {
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      font-weight: 600;
    }
    td.right, th.right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      background: rgba(255, 255, 255, 0.02);
    }
    .total-row td {
      border-bottom: none;
      color: var(--primary);
    }
  </style>
</head>
<body>`;
  }

  private getCategoryName(id: string): string {
    const cat = this.stateService.state().categories.find((c: any) => c.id === id);
    return cat ? cat.name : 'Unknown Category';
  }

  private getBankName(id: string): string {
    const b = this.stateService.state().banks.find(x => x.id === id);
    return b ? b.name : 'Unknown Bank';
  }

  private getMaturityDate(fd: any): Date {
    const date = new Date(fd.startDate);
    date.setMonth(date.getMonth() + fd.months);
    return date;
  }
}
