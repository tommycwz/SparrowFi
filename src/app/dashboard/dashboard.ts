import { Component, computed, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  providers: [DecimalPipe]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  totalCapital = computed(() => {
    const transactions = this.stateService.state().transactions || [];
    let total = 0;
    const fixedDeposits = this.stateService.state().fixedDeposits || [];
    
    // Add active fixed deposits to total capital
    total += fixedDeposits.filter(fd => fd.status === 'active').reduce((sum, fd) => sum + fd.amount, 0);
    
    for (const t of transactions) {
      if (t.accountType === 'bank' || t.accountType === 'wallet') {
        if (t.type === 'income' || t.type === 'others-in') total += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') total -= t.amount;
      }
    }
    
    return total;
  });
    
  bankCount = computed(() => {
    return this.stateService.state().banks.length;
  });

  walletCount = computed(() => {
    return (this.stateService.state().wallets || []).length;
  });

  fixedDepositCount = computed(() => {
    return (this.stateService.state().fixedDeposits || []).filter(fd => fd.status === 'active').length;
  });

  cardCount = computed(() => {
    return (this.stateService.state().cards || []).length;
  });

  recentTransactions = computed(() => {
    const list = this.stateService.state().transactions || [];
    return [...list]
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime())
      .slice(0, 5);
  });

  private doughnutChart: Chart | null = null;
  private barChart: Chart | null = null;

  constructor(
    public router: Router,
    public stateService: StateService
  ) {
    effect(() => {
      const state = this.stateService.state();
      if (this.doughnutChart && this.barChart) {
        this.updateCharts();
      }
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  getCategoryColor(categoryId: string): string {
    const cat = this.stateService.state().categories.find(c => c.id === categoryId);
    return cat ? cat.color || '#888' : '#888';
  }

  getCategoryName(categoryId: string): string {
    const cat = this.stateService.state().categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  }

  getAccountName(type: string, id: string): string {
    if (type === 'cash') return 'Cash';
    if (type === 'others') return 'Others';
    if (type === 'bank') {
      const b = this.stateService.state().banks.find(x => x.id === id);
      return b ? b.name : 'Bank';
    }
    if (type === 'card') {
      const c = this.stateService.state().cards.find(x => x.id === id);
      return c ? c.name : 'Card';
    }
    if (type === 'wallet') {
      const w = this.stateService.state().wallets.find(x => x.id === id);
      return w ? w.name : 'Wallet';
    }
    return 'Account';
  }

  ngOnDestroy() {
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.barChart) this.barChart.destroy();
  }

  private initCharts() {
    const doughnutCanvas = document.getElementById('categoryDoughnutChart') as HTMLCanvasElement;
    const barCanvas = document.getElementById('cashFlowBarChart') as HTMLCanvasElement;

    if (!doughnutCanvas || !barCanvas) return;

    this.doughnutChart = new Chart(doughnutCanvas, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: 'white' } }
        }
      }
    });

    this.barChart = new Chart(barCanvas, {
      type: 'bar',
      data: { labels: ['Income', 'Expense'], datasets: [{ data: [], backgroundColor: ['#00f2fe', '#ff4b4b'] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });

    this.updateCharts();
  }

  private updateCharts() {
    const transactions = this.stateService.state().transactions || [];
    const categories = this.stateService.state().categories || [];

    const expensesByCategory: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        const cat = categories.find((c: any) => c.id === t.categoryId);
        const catName = cat ? cat.name : 'Uncategorized';
        expensesByCategory[catName] = (expensesByCategory[catName] || 0) + t.amount;
      } else if (t.type === 'income') {
        totalIncome += t.amount;
      }
    }

    if (this.doughnutChart) {
      this.doughnutChart.data.labels = Object.keys(expensesByCategory);
      this.doughnutChart.data.datasets[0].data = Object.values(expensesByCategory);
      
      // Map custom category colors
      this.doughnutChart.data.datasets[0].backgroundColor = Object.keys(expensesByCategory).map(name => {
        const cat = categories.find((c: any) => c.name === name);
        return cat?.color || '#FF6384';
      });

      this.doughnutChart.update();
    }

    if (this.barChart) {
      this.barChart.data.datasets[0].data = [totalIncome, totalExpense];
      this.barChart.update();
    }
  }
}
