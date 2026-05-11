import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Transaction } from '../services/state.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.html',
  styleUrls: ['./transaction.scss'],
  providers: [DecimalPipe]
})
export class TransactionComponent {

  protected readonly Math = Math;

  // Form fields
  newType = signal<'income' | 'expense' | 'others-in' | 'others-out'>('expense');
  newDate = new Date().toISOString().split('T')[0];
  newTime = new Date().toTimeString().slice(0, 5); // HH:mm
  autoTime = true; // auto-fill current time on submit
  newAmount: number | null = null;
  newCombinedAccount = ''; // Format: "type:id" (e.g. "bank:uuid", "cash:cash")
  newCategoryId = '';
  newNotes = '';

  // Filter fields
  filterText = '';
  filterCombinedAccount = '';
  filterCategoryId = '';
  filterType = ''; // '' | 'income' | 'expense' | 'others-in' | 'others-out'
  filterMonth = signal<Date>(new Date());
  showAddForm = false;
  editingTransactionId: string | null = null;

  // Dropdown states
  showAccountDropdown = false;
  showCategoryDropdown = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      this.showAccountDropdown = false;
      this.showCategoryDropdown = false;
    }
  }

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

  newTypeToggle(type: 'income' | 'expense' | 'others-in' | 'others-out') {
    this.newType.set(type);
    this.newCategoryId = ''; // Reset category when type changes
  }

  // Display Month (e.g., "May 2026")
  displayMonth = computed(() => {
    return this.filterMonth().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  // Options
  banks = computed(() => this.stateService.state().banks || []);
  cards = computed(() => this.stateService.state().cards || []);
  wallets = computed(() => this.stateService.state().wallets || []);

  // Flattened categories for easier selection
  // Filtered categories based on selected transaction type
  filteredCategories = computed(() => {
    const all = this.stateService.state().categories || [];
    return all.filter(c => !c.type || c.type === this.newType());
  });

  // Monthly Summaries
  monthlyIncome = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  monthlyExpense = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  netBalance = computed(() => this.monthlyIncome() - this.monthlyExpense());

  // Filtered transactions
  transactions = computed(() => {
    let list = this.stateService.state().transactions || [];

    // Filter by Month
    const filterYear = this.filterMonth().getFullYear();
    const filterMonthIndex = this.filterMonth().getMonth();

    list = list.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === filterYear && d.getMonth() === filterMonthIndex;
    });

    if (this.filterType) {
      list = list.filter(t => t.type === this.filterType);
    }

    if (this.filterText) {
      const lower = this.filterText.toLowerCase();
      list = list.filter(t => t.notes.toLowerCase().includes(lower));
    }

    if (this.filterCombinedAccount) {
      const [accType, accId] = this.filterCombinedAccount.split(':');
      list = list.filter(t => t.accountType === accType && (accType === 'cash' || accType === 'others' || t.accountId === accId));
    }

    if (this.filterCategoryId) {
      list = list.filter(t => t.categoryId === this.filterCategoryId);
    }

    // Sort by date descending
    return [...list].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();

      return dateTimeB - dateTimeA;
    });
  });

  constructor(public stateService: StateService) { }

  previousMonth() {
    const current = this.filterMonth();
    this.filterMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.filterMonth();
    this.filterMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  addTransaction() {
    if (this.newDate && this.newAmount !== null && this.newCombinedAccount && this.newCategoryId) {

      const [accType, accId] = this.newCombinedAccount.split(':');
      const resolvedTime = this.autoTime
        ? new Date().toTimeString().slice(0, 5)
        : this.newTime;

      const transactionData = {
        date: this.newDate,
        time: resolvedTime,
        amount: this.newAmount,
        type: this.newType(),
        accountType: accType as any,
        accountId: accId,
        categoryId: this.newCategoryId,
        notes: this.newNotes
      };

      if (this.editingTransactionId) {
        this.stateService.updateTransaction(this.editingTransactionId, transactionData);
        this.editingTransactionId = null;
      } else {
        this.stateService.addTransaction(transactionData);
      }

      this.resetForm();
    }
  }

  editTransaction(t: Transaction) {
    this.editingTransactionId = t.id;
    this.newType.set(t.type);
    this.newAmount = t.amount;
    this.newDate = t.date;
    this.newTime = t.time || '12:00';
    this.newCombinedAccount = `${t.accountType}:${t.accountId}`;
    this.newCategoryId = t.categoryId;
    this.newNotes = t.notes;
    this.autoTime = false; // Disable auto-time when editing
    this.showAddForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingTransactionId = null;
    this.newAmount = null;
    this.newNotes = '';
    this.newCombinedAccount = '';
    this.newCategoryId = '';
    this.showAddForm = false;
    if (this.autoTime) {
      this.newTime = new Date().toTimeString().slice(0, 5);
    }
  }

  deleteTransaction(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.stateService.deleteTransaction(id);
    }
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
    const cat = this.stateService.state().categories.find((x: any) => x.id === id);
    return cat ? cat.name : 'Unknown Category';
  }

  getCategoryColor(id: string): string {
    const cat = this.stateService.state().categories.find((x: any) => x.id === id);
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

  exportCSV() {
    const headers = ['Date', 'Type', 'Amount', 'Account Type', 'Account Name', 'Category', 'Notes'];
    const rows = this.transactions().map(t => [
      t.date,
      t.type,
      t.amount.toString(),
      t.accountType,
      `"${this.getAccountName(t.accountType, t.accountId)}"`,
      `"${this.getCategoryName(t.categoryId)}"`,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const monthStr = this.filterMonth().toISOString().slice(0, 7); // YYYY-MM
    link.download = `transactions_${monthStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importCSV(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCSV(text);
      event.target.value = ''; // Reset input
    };
    reader.readAsText(file);
  }

  private parseCSV(text: string) {
    const lines = text.split('\n');
    if (lines.length <= 1) return;

    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row: string[] = [];
      let currentVal = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && line[j + 1] === '"') {
          currentVal += '"';
          j++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal);
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal);

      if (row.length < 7) continue;

      const [date, type, amountStr, accountType, accountName, categoryName, notes] = row;
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;

      // Find or create category
      let categoryId = '';
      const cleanCatName = categoryName.replace(/^"|"$/g, '');
      const existingCat = this.stateService.state().categories.find((c: any) => c.name.toLowerCase() === cleanCatName.toLowerCase());
      if (existingCat) {
        categoryId = existingCat.id;
      } else {
        this.stateService.addCategory(cleanCatName);
        // Try to fetch it again since state is updated
        const newCat = this.stateService.state().categories.find((c: any) => c.name.toLowerCase() === cleanCatName.toLowerCase());
        if (newCat) categoryId = newCat.id;
      }

      // Find account
      let accId = '';
      let parsedAccType: 'bank' | 'card' | 'cash' | 'others' | 'wallet' = accountType as any;
      const cleanAccName = accountName.replace(/^"|"$/g, '');

      if (parsedAccType === 'bank') {
        const b = this.banks().find(x => x.name.toLowerCase() === cleanAccName.toLowerCase());
        accId = b ? b.id : 'unknown';
      } else if (parsedAccType === 'card') {
        const c = this.cards().find(x => x.name.toLowerCase() === cleanAccName.toLowerCase());
        accId = c ? c.id : 'unknown';
      } else if (parsedAccType === 'wallet') {
        const w = this.wallets().find(x => x.name.toLowerCase() === cleanAccName.toLowerCase());
        accId = w ? w.id : 'unknown';
      } else if (parsedAccType === 'cash') {
        accId = 'cash';
      } else {
        parsedAccType = 'others';
        accId = 'others';
      }

      this.stateService.addTransaction({
        date,
        amount,
        type: type as 'income' | 'expense' | 'others-in' | 'others-out',
        accountType: parsedAccType,
        accountId: accId,
        categoryId: categoryId,
        notes: notes.replace(/^"|"$/g, '')
      });
      importedCount++;
    }

    alert(`Successfully imported ${importedCount} transactions!`);
  }
}
