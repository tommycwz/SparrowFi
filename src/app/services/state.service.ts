import { Injectable, signal, computed } from '@angular/core';

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface Bank {
  id: string;
  name: string;
  initialCapital: number;
  color?: string;
}

export interface Wallet {
  id: string;
  name: string;
  initialCapital: number;
  color?: string;
}

export interface Card {
  id: string;
  name: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  type?: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  date: string;
  time?: string;  // HH:mm — optional, for display purposes
  amount: number;
  type: 'income' | 'expense';
  accountType: 'bank' | 'card' | 'cash' | 'others' | 'wallet';
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
  wallets: Wallet[];
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
    wallets: [],
    cards: [],
    categories: [
      // Income Categories (Greens, Teals, Emeralds)
      // Income Categories (Refined Green & Teal Palette)
      { id: generateUUID(), name: 'Adjustment', color: '#64748B', type: 'income' }, // Slate Gray (neutral for adjustments)
      { id: generateUUID(), name: 'Bank In', color: '#22C55E', type: 'income' },    // Bright Green
      { id: generateUUID(), name: 'Bonus', color: '#FCD34D', type: 'income' },      // Gold/Amber (for special earnings)
      { id: generateUUID(), name: 'Dividend', color: '#10B981', type: 'income' },   // Emerald
      { id: generateUUID(), name: 'Fixed Deposit', color: '#065F46', type: 'income' }, // Forest Green
      { id: generateUUID(), name: 'Others', color: '#94A3B8', type: 'income' },     // Light Slate
      { id: generateUUID(), name: 'Passive', color: '#0EA5E9', type: 'income' },    // Sky Blue (to differentiate from active work)
      { id: generateUUID(), name: 'Share Profit', color: '#0D9488', type: 'income' }, // Teal
      { id: generateUUID(), name: 'Top up', color: '#84CC16', type: 'income' },     // Lime Green

      // Expense Categories (Diverse palette for categorization)
      { id: generateUUID(), name: 'Adjustment', color: '#6B7280', type: 'expense' }, // Gray
      { id: generateUUID(), name: 'Bank Withdrawal', color: '#EF4444', type: 'expense' }, // Red
      { id: generateUUID(), name: 'Bills', color: '#3B82F6', type: 'expense' }, // Blue
      { id: generateUUID(), name: 'Credit Card', color: '#1E40AF', type: 'expense' }, // Dark Blue
      { id: generateUUID(), name: 'Entertainment', color: '#8B5CF6', type: 'expense' }, // Violet
      { id: generateUUID(), name: 'Fixed Deposit', color: '#065F46', type: 'income' }, // Forest Green
      { id: generateUUID(), name: 'Food and Drink', color: '#F97316', type: 'expense' }, // Orange
      { id: generateUUID(), name: 'Grocery', color: '#F59E0B', type: 'expense' }, // Amber
      { id: generateUUID(), name: 'Health and Medical', color: '#EC4899', type: 'expense' }, // Pink
      { id: generateUUID(), name: 'Investment', color: '#6366F1', type: 'expense' }, // Indigo
      { id: generateUUID(), name: 'Others', color: '#9CA3AF', type: 'expense' }, // Light Gray
      { id: generateUUID(), name: 'Petrol', color: '#B45309', type: 'expense' }, // Brown/Amber
      { id: generateUUID(), name: 'Scheduled and Recurring', color: '#7C3AED', type: 'expense' }, // Purple
      { id: generateUUID(), name: 'Travel', color: '#06B6D4', type: 'expense' }, // Cyan
      { id: generateUUID(), name: 'Treats', color: '#D946EF', type: 'expense' }, // Fuchsia
      { id: generateUUID(), name: 'Wallet Top Up', color: '#F43F5E', type: 'expense' }, // Rose
      { id: generateUUID(), name: 'Work', color: '#4B5563', type: 'expense' }  // Slate
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
    const newBank: Bank = { ...bank, id: generateUUID() };
    this.state.set({ ...current, banks: [...current.banks, newBank] });
    this.isDirty.set(true);
  }

  updateBank(id: string, bank: Partial<Bank>) {
    const current = this.state();
    this.state.set({
      ...current,
      banks: current.banks.map(b => b.id === id ? { ...b, ...bank } : b)
    });
    this.isDirty.set(true);
  }

  deleteBank(id: string) {
    const current = this.state();
    this.state.set({ ...current, banks: current.banks.filter(b => b.id !== id) });
    this.isDirty.set(true);
  }

  // --- Wallets ---
  addWallet(wallet: Omit<Wallet, 'id'>) {
    const current = this.state();
    const newWallet: Wallet = { ...wallet, id: generateUUID() };
    this.state.set({ ...current, wallets: [...(current.wallets || []), newWallet] });
    this.isDirty.set(true);
  }

  updateWallet(id: string, wallet: Partial<Wallet>) {
    const current = this.state();
    this.state.set({
      ...current,
      wallets: (current.wallets || []).map(w => w.id === id ? { ...w, ...wallet } : w)
    });
    this.isDirty.set(true);
  }

  deleteWallet(id: string) {
    const current = this.state();
    this.state.set({ ...current, wallets: (current.wallets || []).filter(w => w.id !== id) });
    this.isDirty.set(true);
  }

  // --- Cards ---
  addCard(card: Omit<Card, 'id'>) {
    const current = this.state();
    const newCard: Card = { ...card, id: generateUUID() };
    this.state.set({ ...current, cards: [...(current.cards || []), newCard] });
    this.isDirty.set(true);
  }

  updateCard(id: string, card: Partial<Card>) {
    const current = this.state();
    this.state.set({
      ...current,
      cards: (current.cards || []).map(c => c.id === id ? { ...c, ...card } : c)
    });
    this.isDirty.set(true);
  }

  deleteCard(id: string) {
    const current = this.state();
    this.state.set({ ...current, cards: (current.cards || []).filter(c => c.id !== id) });
    this.isDirty.set(true);
  }

  // --- Categories ---
  addCategory(name: string, color?: string, type?: 'income' | 'expense') {
    const current = this.state();
    const newCategory: Category = { id: generateUUID(), name, color, type };
    const categories = [...(current.categories || []), newCategory].sort((a, b) => a.name.localeCompare(b.name));
    this.state.set({ ...current, categories });
    this.isDirty.set(true);
  }

  updateCategory(id: string, updates: Partial<Category>) {
    const current = this.state();
    const categories = (current.categories || []).map(c => c.id === id ? { ...c, ...updates } : c);
    // Re-sort in case name changed
    categories.sort((a, b) => a.name.localeCompare(b.name));
    this.state.set({ ...current, categories });
    this.isDirty.set(true);
  }

  deleteCategory(id: string) {
    const current = this.state();
    this.state.set({ ...current, categories: (current.categories || []).filter(c => c.id !== id) });
    this.isDirty.set(true);
  }

  randomizeAllCategoryColors() {
    const current = this.state();
    const categories = current.categories.map(c => ({ ...c, color: getRandomColor() }));
    this.state.set({ ...current, categories });
    this.isDirty.set(true);
  }

  // --- Transactions ---
  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const current = this.state();
    if (!transaction.type) transaction.type = 'expense';

    const newTransaction: Transaction = { ...transaction, id: generateUUID() };
    this.state.set({ ...current, transactions: [...(current.transactions || []), newTransaction] });
    this.isDirty.set(true);
  }

  updateTransaction(id: string, updates: Partial<Transaction>) {
    const current = this.state();
    this.state.set({
      ...current,
      transactions: (current.transactions || []).map(t => t.id === id ? { ...t, ...updates } : t)
    });
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
