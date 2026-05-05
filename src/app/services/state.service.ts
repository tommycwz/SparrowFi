import { Injectable, signal, computed } from '@angular/core';

export interface Bank {
  id: string;
  name: string;
  initialCapital: number;
}

export interface Card {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  accountType: 'bank' | 'card' | 'cash' | 'others';
  accountId: string; 
  categoryId: string; 
  notes: string;
}

export interface Settings {
  currency: string;
}

export interface AppState {
  user: {
    isNew: boolean;
    lastExport?: string;
  };
  settings: Settings;
  banks: Bank[];
  cards: Card[];
  categories: Category[];
  transactions: Transaction[];
  // Legacy support for older files
  creditCards?: any[]; 
  dropboxes?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private initialState: AppState = {
    user: { isNew: true },
    settings: { currency: 'myr' },
    banks: [],
    cards: [],
    categories: [
      { id: crypto.randomUUID(), name: 'Bills and Fees' },
      { id: crypto.randomUUID(), name: 'Education' },
      { id: crypto.randomUUID(), name: 'Entertainment' },
      { id: crypto.randomUUID(), name: 'Food and Drink' },
      { id: crypto.randomUUID(), name: 'Groceries' },
      { id: crypto.randomUUID(), name: 'Healthcare' },
      { id: crypto.randomUUID(), name: 'Others' },
      { id: crypto.randomUUID(), name: 'Petrol' },
      { id: crypto.randomUUID(), name: 'Shopping' },
      { id: crypto.randomUUID(), name: 'Transport' },
      { id: crypto.randomUUID(), name: 'Travel' },
      { id: crypto.randomUUID(), name: 'Work' }
    ],
    transactions: []
  };

  // State signals
  readonly state = signal<AppState>(this.deepCopy(this.initialState));
  readonly isDirty = signal<boolean>(false);
  readonly isLoggedIn = signal<boolean>(false);

  // Computed currency symbol
  readonly currencySymbol = computed(() => {
    const curr = (this.state().settings?.currency || 'myr').toLowerCase();
    switch (curr) {
      case 'myr': return 'RM';
      case 'usd': return '$';
      case 'eur': return '€';
      case 'gbp': return '£';
      default: return curr.toUpperCase();
    }
  });

  setState(newState: AppState) {
    // Migration for older files
    if (newState.creditCards && (!newState.cards || newState.cards.length === 0)) {
      newState.cards = newState.creditCards.map(cc => ({ id: cc.id, name: cc.name }));
      delete newState.creditCards;
    }

    if (newState.dropboxes && (!newState.categories || newState.categories.length === 0)) {
      const flattenedCats: Category[] = [];
      for (const d of newState.dropboxes) {
        if (d.children) {
          for (const c of d.children) {
            flattenedCats.push({ id: c.id, name: c.name });
          }
        }
      }
      newState.categories = flattenedCats;
      delete newState.dropboxes;
    }

    if (!newState.settings) {
      newState.settings = { currency: 'myr' };
    }
    
    // Sort categories
    if (newState.categories) {
      newState.categories.sort((a, b) => a.name.localeCompare(b.name));
    }

    const normalizedState = {
      ...this.deepCopy(this.initialState),
      ...newState
    };
    this.state.set(normalizedState);
    this.isDirty.set(false);
    this.isLoggedIn.set(true);
  }

  startNewUser() {
    this.setState(this.deepCopy(this.initialState));
    this.isDirty.set(true);
  }

  logout() {
    this.state.set(this.deepCopy(this.initialState));
    this.isDirty.set(false);
    this.isLoggedIn.set(false);
  }

  // --- Settings ---
  updateSettings(settings: Settings) {
    const current = this.state();
    this.state.set({ ...current, settings });
    this.isDirty.set(true);
  }

  // --- Banks ---
  addBank(bank: Omit<Bank, 'id'>) {
    const current = this.state();
    const newBank: Bank = { ...bank, id: crypto.randomUUID() };
    this.state.set({ ...current, banks: [...current.banks, newBank] });
    this.isDirty.set(true);
  }

  deleteBank(id: string) {
    const current = this.state();
    this.state.set({ ...current, banks: current.banks.filter(b => b.id !== id) });
    this.isDirty.set(true);
  }

  // --- Cards ---
  addCard(card: Omit<Card, 'id'>) {
    const current = this.state();
    const newCard: Card = { ...card, id: crypto.randomUUID() };
    this.state.set({ ...current, cards: [...(current.cards || []), newCard] });
    this.isDirty.set(true);
  }

  deleteCard(id: string) {
    const current = this.state();
    this.state.set({ ...current, cards: (current.cards || []).filter(c => c.id !== id) });
    this.isDirty.set(true);
  }

  // --- Categories ---
  addCategory(name: string) {
    const current = this.state();
    const newCategory: Category = { id: crypto.randomUUID(), name };
    const categories = [...(current.categories || []), newCategory].sort((a, b) => a.name.localeCompare(b.name));
    this.state.set({ ...current, categories });
    this.isDirty.set(true);
  }

  deleteCategory(id: string) {
    const current = this.state();
    this.state.set({ ...current, categories: (current.categories || []).filter(c => c.id !== id) });
    this.isDirty.set(true);
  }

  // --- Transactions ---
  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const current = this.state();
    if (!transaction.type) transaction.type = 'expense';
    
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    this.state.set({ ...current, transactions: [...(current.transactions || []), newTransaction] });
    this.isDirty.set(true);
  }

  deleteTransaction(id: string) {
    const current = this.state();
    this.state.set({ ...current, transactions: (current.transactions || []).filter(t => t.id !== id) });
    this.isDirty.set(true);
  }

  markClean() {
    this.isDirty.set(false);
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
