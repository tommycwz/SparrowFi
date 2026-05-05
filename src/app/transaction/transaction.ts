import { Component, computed, signal } from '@angular/core';
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
  // Form fields
  newType: 'income' | 'expense' = 'expense';
  newDate = new Date().toISOString().split('T')[0];
  newAmount: number | null = null;
  newCombinedAccount = ''; // Format: "type:id" (e.g. "bank:uuid", "cash:cash")
  newCategoryId = '';
  newNotes = '';

  // Filter fields
  filterText = '';
  filterCombinedAccount = ''; // For history filtering
  filterCategoryId = '';
  filterType = ''; // '' | 'income' | 'expense'
  filterMonth = signal<Date>(new Date());

  // Display Month (e.g., "May 2026")
  displayMonth = computed(() => {
    return this.filterMonth().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  // Options
  banks = computed(() => this.stateService.state().banks || []);
  cards = computed(() => this.stateService.state().cards || []);
  
  // Flattened categories for easier selection
  categories = computed(() => this.stateService.state().categories || []);

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
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  constructor(public stateService: StateService) {}

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

      this.stateService.addTransaction({
        date: this.newDate,
        amount: this.newAmount,
        type: this.newType,
        accountType: accType as any,
        accountId: accId,
        categoryId: this.newCategoryId,
        notes: this.newNotes
      });

      this.newAmount = null;
      this.newNotes = '';
      this.newCombinedAccount = '';
      this.newCategoryId = '';
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
    return 'Unknown';
  }

  getCategoryName(id: string): string {
    const cat = this.categories().find(x => x.id === id);
    return cat ? cat.name : 'Unknown Category';
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
        if (char === '"' && line[j+1] === '"') {
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
      const existingCat = this.categories().find(c => c.name.toLowerCase() === cleanCatName.toLowerCase());
      if (existingCat) {
        categoryId = existingCat.id;
      } else {
        categoryId = crypto.randomUUID();
        this.stateService.addCategory(cleanCatName);
        // Try to fetch it again since state is updated
        const newCat = this.stateService.state().categories.find(c => c.name.toLowerCase() === cleanCatName.toLowerCase());
        if (newCat) categoryId = newCat.id;
      }

      // Find account
      let accId = '';
      let parsedAccType: 'bank' | 'card' | 'cash' | 'others' = accountType as any;
      const cleanAccName = accountName.replace(/^"|"$/g, '');
      
      if (parsedAccType === 'bank') {
        const b = this.banks().find(x => x.name.toLowerCase() === cleanAccName.toLowerCase());
        accId = b ? b.id : 'unknown';
      } else if (parsedAccType === 'card') {
        const c = this.cards().find(x => x.name.toLowerCase() === cleanAccName.toLowerCase());
        accId = c ? c.id : 'unknown';
      } else if (parsedAccType === 'cash') {
        accId = 'cash';
      } else {
        parsedAccType = 'others';
        accId = 'others';
      }

      this.stateService.addTransaction({
        date,
        amount,
        type: type as 'income' | 'expense',
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
