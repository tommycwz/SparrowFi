import { Component, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Transaction } from '../services/state.service';

type ReportFormat = 'view' | 'pdf' | 'csv';

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

  constructor(public stateService: StateService) { }

  generateReport(format: ReportFormat) {
    if (!this.selectedMonth) {
      alert("Please select a month and year.");
      return;
    }

    const state = this.stateService.state();
    const transactions = state.transactions || [];

    const yearMonth = this.selectedMonth; // e.g., "2026-05"
    const monthTransactions = transactions.filter(t => t.date.startsWith(yearMonth));

    const incomeCategories: { [id: string]: number } = {};
    let totalIncome = 0;

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

    // Cumulative asset balances
    const bankBalances: { [id: string]: number } = {};
    const walletBalances: { [id: string]: number } = {};
    const cardBalances: { [id: string]: number } = {};

    for (const b of state.banks) bankBalances[b.id] = 0;
    for (const w of (state.wallets || [])) walletBalances[w.id] = 0;
    for (const c of (state.cards || [])) cardBalances[c.id] = 0;

    for (const t of transactions) {
      if (t.accountType === 'bank' && bankBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') bankBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') bankBalances[t.accountId] -= t.amount;
      }
      if (t.accountType === 'wallet' && walletBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') walletBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') walletBalances[t.accountId] -= t.amount;
      }
      if (t.accountType === 'card' && cardBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') cardBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') cardBalances[t.accountId] -= t.amount;
      }
    }

    let totalBanks = 0;
    for (const bank of state.banks) {
      totalBanks += bankBalances[bank.id];
    }

    let totalWallets = 0;
    for (const wallet of (state.wallets || [])) {
      totalWallets += walletBalances[wallet.id];
    }

    let totalCards = 0;
    for (const card of (state.cards || [])) {
      totalCards += cardBalances[card.id];
    }

    let totalFD = 0;
    const activeFDs = (state.fixedDeposits || []).filter(fd => fd.status === 'active');
    for (const fd of activeFDs) {
      totalFD += fd.amount;
    }

    if (format === 'csv') {
      let csv = [];
      csv.push(`Monthly Financial Report,${yearMonth}`);
      csv.push(``);

      csv.push(`INCOME ANALYSIS`);
      csv.push(`Category,Amount,Percentage`);
      for (const catId of Object.keys(incomeCategories)) {
        const pct = totalIncome > 0 ? (incomeCategories[catId] / totalIncome) * 100 : 0;
        csv.push(`"${this.getCategoryName(catId)}",${incomeCategories[catId].toFixed(2)},${pct.toFixed(1)}%`);
      }
      csv.push(`"TOTAL INCOME",${totalIncome.toFixed(2)},100.0%`);
      csv.push(``);

      csv.push(`EXPENSES ANALYSIS`);
      csv.push(`Category,Amount,Percentage`);
      for (const catId of Object.keys(expenseCategories)) {
        const pct = totalExpense > 0 ? (expenseCategories[catId] / totalExpense) * 100 : 0;
        csv.push(`"${this.getCategoryName(catId)}",${expenseCategories[catId].toFixed(2)},${pct.toFixed(1)}%`);
      }
      csv.push(`"TOTAL EXPENSES",${totalExpense.toFixed(2)},100.0%`);
      csv.push(``);

      csv.push(`"NET CASH FLOW",${(totalIncome - totalExpense).toFixed(2)}`);
      csv.push(``);

      csv.push(`CURRENT ASSET BALANCES`);
      csv.push(`Banks`);
      csv.push(`Account Name,Balance`);
      for (const bank of state.banks) {
        csv.push(`"${bank.name}",${bankBalances[bank.id].toFixed(2)}`);
      }
      csv.push(`"Total Bank Capital",${totalBanks.toFixed(2)}`);
      csv.push(``);

      csv.push(`Wallets`);
      csv.push(`Account Name,Balance`);
      for (const wallet of (state.wallets || [])) {
        csv.push(`"${wallet.name}",${walletBalances[wallet.id].toFixed(2)}`);
      }
      csv.push(`"Total Wallet Capital",${totalWallets.toFixed(2)}`);
      csv.push(``);

      csv.push(`Credit Cards`);
      csv.push(`Account Name,Outstanding`);
      for (const card of (state.cards || [])) {
        csv.push(`"${card.name}",${cardBalances[card.id].toFixed(2)}`);
      }
      csv.push(`"Total Credit Card Outstanding",${totalCards.toFixed(2)}`);
      csv.push(``);

      csv.push(`Fixed Deposits (Active)`);
      csv.push(`Bank,Principal,Maturity Date`);
      for (const fd of activeFDs) {
        csv.push(`"${this.getBankName(fd.bankId)}",${fd.amount.toFixed(2)},${this.getMaturityDate(fd).toISOString().split('T')[0]}`);
      }
      csv.push(`"Total Active FDs",${totalFD.toFixed(2)}`);
      csv.push(``);

      csv.push(`"NET ASSET BALANCE",${(totalBanks + totalWallets + totalFD + totalCards).toFixed(2)}`);

      this.downloadFile(csv.join('\n'), `Financial_Report_${yearMonth}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const curr = this.stateService.currencySymbol();
      const formatCurrency = (val: number) => {
        const isNegative = val < 0;
        const absVal = Math.abs(val).toFixed(2);
        return isNegative ? `-${curr}${absVal}` : `${curr}${absVal}`;
      };

      // Prepare serializable data for charts
      const incomeChartData = Object.keys(incomeCategories).map(catId => ({
        label: this.getCategoryName(catId),
        value: Number(incomeCategories[catId].toFixed(2)),
        color: this.getCategoryColor(catId)
      }));

      const expenseChartData = Object.keys(expenseCategories).map(catId => ({
        label: this.getCategoryName(catId),
        value: Number(expenseCategories[catId].toFixed(2)),
        color: this.getCategoryColor(catId)
      }));

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
            <h2 class="section-title">Income Analysis</h2>
            <div class="chart-card">
              <canvas id="incomeChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(incomeCategories).map(catId => {
                  const pct = totalIncome > 0 ? (incomeCategories[catId] / totalIncome) * 100 : 0;
                  return `
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(catId)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${pct}%; background-color: ${this.getCategoryColor(catId)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${pct.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${formatCurrency(incomeCategories[catId])}</td>
                    </tr>
                  `;
                }).join('')}
                ${Object.keys(incomeCategories).length === 0 ? '<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this month</td></tr>' : ''}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${formatCurrency(totalIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expenses Analysis</h2>
            <div class="chart-card">
              <canvas id="expenseChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(expenseCategories).map(catId => {
                  const pct = totalExpense > 0 ? (expenseCategories[catId] / totalExpense) * 100 : 0;
                  return `
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(catId)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${pct}%; background-color: ${this.getCategoryColor(catId)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${pct.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${formatCurrency(expenseCategories[catId])}</td>
                    </tr>
                  `;
                }).join('')}
                ${Object.keys(expenseCategories).length === 0 ? '<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this month</td></tr>' : ''}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${formatCurrency(totalExpense)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 3rem;">Current Asset Balances</h2>
        <div class="assets-grid">
          <!-- Banks -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">🏦</span>
              <h3>Banks</h3>
            </div>
            <table>
              <tbody>
                ${state.banks.map(bank => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${bank.color || 'var(--primary)'};"></span>
                        <span>${bank.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${formatCurrency(bankBalances[bank.id])}</td>
                  </tr>
                `).join('')}
                ${state.banks.length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${formatCurrency(totalBanks)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Wallets -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💼</span>
              <h3>Wallets</h3>
            </div>
            <table>
              <tbody>
                ${(state.wallets || []).map(wallet => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${wallet.color || 'var(--success)'};"></span>
                        <span>${wallet.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${formatCurrency(walletBalances[wallet.id])}</td>
                  </tr>
                `).join('')}
                ${(state.wallets || []).length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${formatCurrency(totalWallets)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Credit Cards -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💳</span>
              <h3>Credit Card Expenses</h3>
            </div>
            <table>
              <tbody>
                ${(state.cards || []).map(card => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${card.color || 'var(--danger)'};"></span>
                        <span>${card.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600; color: ${cardBalances[card.id] < 0 ? 'var(--danger)' : 'var(--text)'};">
                      ${formatCurrency(cardBalances[card.id])}
                    </td>
                  </tr>
                `).join('')}
                ${(state.cards || []).length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${totalCards < 0 ? 'var(--danger)' : 'var(--text)'};">${formatCurrency(totalCards)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fixed Deposits -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💰</span>
              <h3>Fixed Deposits</h3>
            </div>
            <table>
              <tbody>
                ${(state.fixedDeposits || []).filter(fd => fd.status === 'active').map(fd => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(fd.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(fd).toISOString().split('T')[0]} (${fd.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${formatCurrency(fd.amount)}</td>
                  </tr>
                `).join('')}
                ${(state.fixedDeposits || []).filter(fd => fd.status === 'active').length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Fixed Deposits</td>
                  <td class="right">${formatCurrency(totalFD)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-assets-summary">
          <div class="summary-line">
            <span>Total Liquid Assets (Banks + Wallets)</span>
            <strong>${formatCurrency(totalBanks + totalWallets)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${formatCurrency(totalFD)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${formatCurrency(totalCards)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${(totalBanks + totalWallets + totalFD + totalCards) >= 0 ? 'success' : 'danger'}">
              ${formatCurrency(totalBanks + totalWallets + totalFD + totalCards)}
            </span>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          Chart.defaults.color = '#94a3b8';
          Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
          Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

          const incomeData = ${JSON.stringify(incomeChartData)};
          const expenseData = ${JSON.stringify(expenseChartData)};

          const drawChart = (canvasId, dataList) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (dataList.length === 0) {
              ctx.font = '14px sans-serif';
              ctx.fillStyle = '#94a3b8';
              ctx.textAlign = 'center';
              ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
              return;
            }
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: dataList.map(x => x.label),
                datasets: [{
                  data: dataList.map(x => x.value),
                  backgroundColor: dataList.map(x => x.color),
                  borderWidth: 2,
                  borderColor: '#1e293b'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 8,
                      padding: 8,
                      font: { size: 10 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ' ' + context.label + ': ' + '${curr}' + context.raw.toFixed(2)
                    }
                  }
                },
                cutout: '65%'
              }
            });
          };

          drawChart('incomeChart', incomeData);
          drawChart('expenseChart', expenseData);
        </script>
      </body>
      </html>`;

      this.openHtmlWindow(html, format === 'pdf');
    }
  }

  generateAnnualReport(format: ReportFormat) {
    if (!this.selectedYear) {
      alert("Please select a year.");
      return;
    }

    const yearStr = this.selectedYear.toString();
    const state = this.stateService.state();
    const transactions = state.transactions || [];

    const yearTransactions = transactions.filter(t => t.date.startsWith(yearStr));

    const incomeCategories: { [id: string]: number } = {};
    let totalIncome = 0;

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

    // Cumulative asset balances
    const bankBalances: { [id: string]: number } = {};
    const walletBalances: { [id: string]: number } = {};
    const cardBalances: { [id: string]: number } = {};

    for (const b of state.banks) bankBalances[b.id] = 0;
    for (const w of (state.wallets || [])) walletBalances[w.id] = 0;
    for (const c of (state.cards || [])) cardBalances[c.id] = 0;

    for (const t of transactions) {
      if (t.accountType === 'bank' && bankBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') bankBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') bankBalances[t.accountId] -= t.amount;
      }
      if (t.accountType === 'wallet' && walletBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') walletBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') walletBalances[t.accountId] -= t.amount;
      }
      if (t.accountType === 'card' && cardBalances[t.accountId] !== undefined) {
        if (t.type === 'income' || t.type === 'others-in') cardBalances[t.accountId] += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') cardBalances[t.accountId] -= t.amount;
      }
    }

    let totalBanks = 0;
    for (const bank of state.banks) {
      totalBanks += bankBalances[bank.id];
    }

    let totalWallets = 0;
    for (const wallet of (state.wallets || [])) {
      totalWallets += walletBalances[wallet.id];
    }

    let totalCards = 0;
    for (const card of (state.cards || [])) {
      totalCards += cardBalances[card.id];
    }

    let totalFD = 0;
    const activeFDs = (state.fixedDeposits || []).filter(fd => fd.status === 'active');
    for (const fd of activeFDs) {
      totalFD += fd.amount;
    }

    // Month-on-month trend calculation for Grouped Bar Chart
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    for (const t of yearTransactions) {
      const parts = t.date.split('-');
      if (parts.length >= 2) {
        const mIdx = parseInt(parts[1], 10) - 1; // 0 to 11
        if (mIdx >= 0 && mIdx < 12) {
          if (t.type === 'income') {
            monthlyIncome[mIdx] += t.amount;
          } else if (t.type === 'expense') {
            monthlyExpense[mIdx] += t.amount;
          }
        }
      }
    }

    if (format === 'csv') {
      let csv = [];
      csv.push(`Annual Summary Report,${yearStr}`);
      csv.push(``);

      csv.push(`INCOME ANALYSIS`);
      csv.push(`Category,Amount,Percentage`);
      for (const catId of Object.keys(incomeCategories)) {
        const pct = totalIncome > 0 ? (incomeCategories[catId] / totalIncome) * 100 : 0;
        csv.push(`"${this.getCategoryName(catId)}",${incomeCategories[catId].toFixed(2)},${pct.toFixed(1)}%`);
      }
      csv.push(`"TOTAL INCOME",${totalIncome.toFixed(2)},100.0%`);
      csv.push(``);

      csv.push(`EXPENSES ANALYSIS`);
      csv.push(`Category,Amount,Percentage`);
      for (const catId of Object.keys(expenseCategories)) {
        const pct = totalExpense > 0 ? (expenseCategories[catId] / totalExpense) * 100 : 0;
        csv.push(`"${this.getCategoryName(catId)}",${expenseCategories[catId].toFixed(2)},${pct.toFixed(1)}%`);
      }
      csv.push(`"TOTAL EXPENSES",${totalExpense.toFixed(2)},100.0%`);
      csv.push(``);

      csv.push(`"NET CASH FLOW",${(totalIncome - totalExpense).toFixed(2)}`);
      csv.push(``);

      csv.push(`CURRENT ASSET BALANCES`);
      csv.push(`Banks`);
      csv.push(`Account Name,Balance`);
      for (const bank of state.banks) {
        csv.push(`"${bank.name}",${bankBalances[bank.id].toFixed(2)}`);
      }
      csv.push(`"Total Bank Capital",${totalBanks.toFixed(2)}`);
      csv.push(``);

      csv.push(`Wallets`);
      csv.push(`Account Name,Balance`);
      for (const wallet of (state.wallets || [])) {
        csv.push(`"${wallet.name}",${walletBalances[wallet.id].toFixed(2)}`);
      }
      csv.push(`"Total Wallet Capital",${totalWallets.toFixed(2)}`);
      csv.push(``);

      csv.push(`Credit Cards`);
      csv.push(`Account Name,Outstanding`);
      for (const card of (state.cards || [])) {
        csv.push(`"${card.name}",${cardBalances[card.id].toFixed(2)}`);
      }
      csv.push(`"Total Credit Card Outstanding",${totalCards.toFixed(2)}`);
      csv.push(``);

      csv.push(`Fixed Deposits (Active)`);
      csv.push(`Bank,Principal,Maturity Date`);
      for (const fd of activeFDs) {
        csv.push(`"${this.getBankName(fd.bankId)}",${fd.amount.toFixed(2)},${this.getMaturityDate(fd).toISOString().split('T')[0]}`);
      }
      csv.push(`"Total Active FDs",${totalFD.toFixed(2)}`);
      csv.push(``);

      csv.push(`"NET ASSET BALANCE",${(totalBanks + totalWallets + totalFD + totalCards).toFixed(2)}`);

      this.downloadFile(csv.join('\n'), `Annual_Summary_${yearStr}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const curr = this.stateService.currencySymbol();
      const formatCurrency = (val: number) => {
        const isNegative = val < 0;
        const absVal = Math.abs(val).toFixed(2);
        return isNegative ? `-${curr}${absVal}` : `${curr}${absVal}`;
      };

      // Prepare serializable data for charts
      const incomeChartData = Object.keys(incomeCategories).map(catId => ({
        label: this.getCategoryName(catId),
        value: Number(incomeCategories[catId].toFixed(2)),
        color: this.getCategoryColor(catId)
      }));

      const expenseChartData = Object.keys(expenseCategories).map(catId => ({
        label: this.getCategoryName(catId),
        value: Number(expenseCategories[catId].toFixed(2)),
        color: this.getCategoryColor(catId)
      }));

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

        <!-- Annual Trend Bar Chart -->
        <h2 class="section-title">Monthly Income vs Expenses Trend</h2>
        <div class="chart-card" style="height: 320px; margin-bottom: 2.5rem; display: block; width: 100%;">
          <canvas id="trendChart" style="width: 100%; height: 100%;"></canvas>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Income Analysis</h2>
            <div class="chart-card">
              <canvas id="incomeChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(incomeCategories).map(catId => {
                  const pct = totalIncome > 0 ? (incomeCategories[catId] / totalIncome) * 100 : 0;
                  return `
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(catId)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${pct}%; background-color: ${this.getCategoryColor(catId)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${pct.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${formatCurrency(incomeCategories[catId])}</td>
                    </tr>
                  `;
                }).join('')}
                ${Object.keys(incomeCategories).length === 0 ? '<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this year</td></tr>' : ''}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${formatCurrency(totalIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expenses Analysis</h2>
            <div class="chart-card">
              <canvas id="expenseChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(expenseCategories).map(catId => {
                  const pct = totalExpense > 0 ? (expenseCategories[catId] / totalExpense) * 100 : 0;
                  return `
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(catId)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${pct}%; background-color: ${this.getCategoryColor(catId)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${pct.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${formatCurrency(expenseCategories[catId])}</td>
                    </tr>
                  `;
                }).join('')}
                ${Object.keys(expenseCategories).length === 0 ? '<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this year</td></tr>' : ''}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${formatCurrency(totalExpense)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 3rem;">Current Asset Balances</h2>
        <div class="assets-grid">
          <!-- Banks -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">🏦</span>
              <h3>Banks</h3>
            </div>
            <table>
              <tbody>
                ${state.banks.map(bank => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${bank.color || 'var(--primary)'};"></span>
                        <span>${bank.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${formatCurrency(bankBalances[bank.id])}</td>
                  </tr>
                `).join('')}
                ${state.banks.length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${formatCurrency(totalBanks)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Wallets -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💼</span>
              <h3>Wallets</h3>
            </div>
            <table>
              <tbody>
                ${(state.wallets || []).map(wallet => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${wallet.color || 'var(--success)'};"></span>
                        <span>${wallet.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${formatCurrency(walletBalances[wallet.id])}</td>
                  </tr>
                `).join('')}
                ${(state.wallets || []).length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${formatCurrency(totalWallets)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Credit Cards -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💳</span>
              <h3>Credit Card Expenses</h3>
            </div>
            <table>
              <tbody>
                ${(state.cards || []).map(card => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${card.color || 'var(--danger)'};"></span>
                        <span>${card.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600; color: ${cardBalances[card.id] < 0 ? 'var(--danger)' : 'var(--text)'};">
                      ${formatCurrency(cardBalances[card.id])}
                    </td>
                  </tr>
                `).join('')}
                ${(state.cards || []).length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${totalCards < 0 ? 'var(--danger)' : 'var(--text)'};">${formatCurrency(totalCards)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fixed Deposits -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">💰</span>
              <h3>Fixed Deposits</h3>
            </div>
            <table>
              <tbody>
                ${(state.fixedDeposits || []).filter(fd => fd.status === 'active').map(fd => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(fd.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(fd).toISOString().split('T')[0]} (${fd.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${formatCurrency(fd.amount)}</td>
                  </tr>
                `).join('')}
                ${(state.fixedDeposits || []).filter(fd => fd.status === 'active').length === 0 ? '<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>' : ''}
                <tr class="asset-total-row">
                  <td>Total Fixed Deposits</td>
                  <td class="right">${formatCurrency(totalFD)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-assets-summary">
          <div class="summary-line">
            <span>Total Liquid Assets (Banks + Wallets)</span>
            <strong>${formatCurrency(totalBanks + totalWallets)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${formatCurrency(totalFD)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${formatCurrency(totalCards)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${(totalBanks + totalWallets + totalFD + totalCards) >= 0 ? 'success' : 'danger'}">
              ${formatCurrency(totalBanks + totalWallets + totalFD + totalCards)}
            </span>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          Chart.defaults.color = '#94a3b8';
          Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
          Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

          const incomeData = ${JSON.stringify(incomeChartData)};
          const expenseData = ${JSON.stringify(expenseChartData)};
          const monthlyIncome = ${JSON.stringify(monthlyIncome)};
          const monthlyExpense = ${JSON.stringify(monthlyExpense)};

          const drawChart = (canvasId, dataList) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (dataList.length === 0) {
              ctx.font = '14px sans-serif';
              ctx.fillStyle = '#94a3b8';
              ctx.textAlign = 'center';
              ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
              return;
            }
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: dataList.map(x => x.label),
                datasets: [{
                  data: dataList.map(x => x.value),
                  backgroundColor: dataList.map(x => x.color),
                  borderWidth: 2,
                  borderColor: '#1e293b'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 8,
                      padding: 8,
                      font: { size: 10 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ' ' + context.label + ': ' + '${curr}' + context.raw.toFixed(2)
                    }
                  }
                },
                cutout: '65%'
              }
            });
          };

          drawChart('incomeChart', incomeData);
          drawChart('expenseChart', expenseData);

          // Render Annual Grouped Bar Chart
          const trendCtx = document.getElementById('trendChart').getContext('2d');
          new Chart(trendCtx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Income',
                  data: monthlyIncome,
                  backgroundColor: '#22c55e',
                  borderRadius: 4
                },
                {
                  label: 'Expenses',
                  data: monthlyExpense,
                  backgroundColor: '#ef4444',
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                  grid: { display: false }
                }
              },
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context) => ' ' + context.dataset.label + ': ' + '${curr}' + context.raw.toFixed(2)
                  }
                }
              }
            }
          });
        </script>
      </body>
      </html>`;

      this.openHtmlWindow(html, format === 'pdf');
    }
  }

  private openHtmlWindow(htmlContent: string, triggerPrint: boolean) {
    const reportWindow = window.open('', '_blank');

    if (reportWindow) {
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();

      if (triggerPrint) {
        reportWindow.focus();
        setTimeout(() => {
          reportWindow.print();
        }, 250);
      }
    } else {
      alert('Your browser blocked the popup. Please enable popups to generate reports.');
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
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
      margin-bottom: 1.5rem;
      margin-top: 2rem;
      color: var(--primary);
      font-size: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(255, 255, 255, 0.04);
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
    .progress-container {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      height: 6px;
      margin-top: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .asset-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .asset-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    .asset-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .asset-icon {
      font-size: 1.3rem;
    }
    .color-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .asset-total-row {
      font-weight: bold;
      background: rgba(255, 255, 255, 0.02);
    }
    .asset-total-row td {
      color: var(--primary) !important;
      border-top: 1px solid var(--border);
    }
    .net-assets-summary {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 500px;
      margin-left: auto;
      margin-top: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .summary-line strong {
      color: var(--text);
    }
    .summary-line.grand-total {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px dashed var(--border);
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--text);
    }
    .grand-total .success {
      color: var(--success);
    }
    .grand-total .danger {
      color: var(--danger);
    }
    @media print {
      body {
        padding: 0;
        background: transparent !important;
        color: #000000 !important;
      }
      .card { page-break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .chart-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>`;
  }

  private getCategoryName(id: string): string {
    const cat = this.stateService.state().categories.find((c: any) => c.id === id);
    return cat ? cat.name : 'Unknown Category';
  }

  private getCategoryColor(id: string): string {
    const cat = this.stateService.state().categories.find((c: any) => c.id === id);
    return cat ? cat.color || '#3b82f6' : '#3b82f6';
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