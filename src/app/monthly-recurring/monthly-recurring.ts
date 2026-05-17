import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, RecurringTransaction } from '../services/state.service';

@Component({
  selector: 'app-monthly-recurring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-recurring.html',
  styleUrls: ['./monthly-recurring.scss']
})
export class MonthlyRecurringComponent {
  newStartDate = new Date().toISOString().split('T')[0];
  newMonths: number | null = null;
  newAmount: number | null = null;
  newCombinedAccount = ''; // "type:id" e.g. "bank:uuid"
  newCategoryId = '';
  newNotes = '';
  newActive = true;
  editingId: string | null = null;

  showAccountDropdown = false;
  showCategoryDropdown = false;

  banks = computed(() => this.stateService.state().banks || []);
  cards = computed(() => this.stateService.state().cards || []);
  wallets = computed(() => this.stateService.state().wallets || []);
  categories = computed(() => this.stateService.state().categories || []);
  recurringTransactions = computed(() => this.stateService.state().recurringTransactions || []);

  selectedCategoryFilter = signal<'income' | 'expense' | 'others-in' | 'others-out'>('expense');

  filteredCategories = computed(() => {
    const all = this.categories();
    const filter = this.selectedCategoryFilter();
    return all.filter(c => c.type === filter);
  });

  setCategoryFilter(filter: 'income' | 'expense' | 'others-in' | 'others-out') {
    this.selectedCategoryFilter.set(filter);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      this.showAccountDropdown = false;
      this.showCategoryDropdown = false;
    }
  }

  constructor(public stateService: StateService) {}

  toggleAccountDropdown(event: Event) {
    event.stopPropagation();
    this.showAccountDropdown = !this.showAccountDropdown;
    this.showCategoryDropdown = false;
  }

  toggleCategoryDropdown(event: Event) {
    event.stopPropagation();
    this.showCategoryDropdown = !this.showCategoryDropdown;
    this.showAccountDropdown = false;
  }

  selectAccount(type: string, id: string) {
    this.newCombinedAccount = `${type}:${id}`;
    this.showAccountDropdown = false;
  }

  selectCategory(id: string) {
    this.newCategoryId = id;
    this.showCategoryDropdown = false;
  }

  saveRecurringTransaction() {
    if (this.newStartDate && this.newMonths !== null && this.newAmount !== null && this.newCombinedAccount && this.newCategoryId) {
      const [accType, accId] = this.newCombinedAccount.split(':');
      
      const rtData = {
        startDate: this.newStartDate,
        months: this.newMonths,
        amount: this.newAmount,
        accountType: accType as any,
        accountId: accId,
        categoryId: this.newCategoryId,
        notes: this.newNotes,
        active: this.newActive
      };

      if (this.editingId) {
        this.stateService.updateRecurringTransaction(this.editingId, rtData);
      } else {
        this.stateService.addRecurringTransaction(rtData);
      }

      this.resetForm();
    }
  }

  editRecurringTransaction(rt: RecurringTransaction) {
    this.editingId = rt.id;
    this.newStartDate = rt.startDate;
    this.newMonths = rt.months;
    this.newAmount = rt.amount;
    this.newCombinedAccount = `${rt.accountType}:${rt.accountId}`;
    this.newCategoryId = rt.categoryId;
    this.newNotes = rt.notes;
    this.newActive = rt.active;

    // Auto-set the category type filter based on editing category type
    const cat = this.categories().find(c => c.id === rt.categoryId);
    if (cat && cat.type) {
      this.selectedCategoryFilter.set(cat.type);
    } else {
      this.selectedCategoryFilter.set('expense');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingId = null;
    this.newStartDate = new Date().toISOString().split('T')[0];
    this.newMonths = null;
    this.newAmount = null;
    this.newCombinedAccount = '';
    this.newCategoryId = '';
    this.newNotes = '';
    this.newActive = true;
    this.showAccountDropdown = false;
    this.showCategoryDropdown = false;
    this.selectedCategoryFilter.set('expense');
  }

  deleteRecurringTransaction(id: string) {
    if (confirm('Are you sure you want to delete this monthly recurring transaction? This action cannot be undone.')) {
      this.stateService.deleteRecurringTransaction(id);
    }
  }

  triggerRecurringTransaction(id: string) {
    this.stateService.triggerRecurringTransaction(id);
    alert('Recurring transaction successfully triggered! A new transaction entry has been added.');
  }

  getAccountName(type: string, id: string): string {
    if (type === 'cash') return 'Cash';
    if (type === 'others') return 'Others';
    if (type === 'bank') {
      const b = this.banks().find(x => x.id === id);
      return b ? b.name : 'Unknown Bank';
    }
    if (type === 'card') {
      const c = this.cards().find(x => x.id === id);
      return c ? c.name : 'Unknown Card';
    }
    if (type === 'wallet') {
      const w = this.wallets().find(x => x.id === id);
      return w ? w.name : 'Unknown Wallet';
    }
    return 'Unknown';
  }

  getCategoryName(id: string): string {
    const cat = this.categories().find((x: any) => x.id === id);
    return cat ? cat.name : 'Unknown Category';
  }

  getCategoryColor(id: string): string {
    const cat = this.categories().find((x: any) => x.id === id);
    return cat?.color || '#888888';
  }

  getAccountColor(type: string, id: string): string {
    if (type === 'bank') {
      return this.banks().find((x: any) => x.id === id)?.color || '#4facfe';
    }
    if (type === 'card') {
      return this.cards().find((x: any) => x.id === id)?.color || '#ff4b4b';
    }
    if (type === 'wallet') {
      return this.wallets().find((x: any) => x.id === id)?.color || '#00f2fe';
    }
    return '#888888';
  }

  getNextTransactionDate(rt: RecurringTransaction): string {
    if (rt.triggeredCount >= rt.months) {
      return 'Fully Triggered';
    }
    const [year, month, day] = rt.startDate.split('-').map(Number);
    const date = new Date(year, month - 1 + rt.triggeredCount, 1);
    const maxDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(day, maxDays);
    
    // Format DD/MM/YYYY
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(targetDay).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
}
