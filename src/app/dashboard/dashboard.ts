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
    const banks = this.stateService.state().banks || [];
    const transactions = this.stateService.state().transactions || [];
    
    let total = banks.reduce((sum, bank) => sum + bank.initialCapital, 0);
    
    for (const t of transactions) {
      if (t.accountType === 'bank') {
        if (t.type === 'income') total += t.amount;
        if (t.type === 'expense') total -= t.amount;
      }
    }
    
    return total;
  });
  
  bankCount = computed(() => {
    return this.stateService.state().banks.length;
  });

  cardCount = computed(() => {
    return (this.stateService.state().cards || []).length;
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
