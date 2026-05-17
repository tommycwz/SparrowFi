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
  type?: 'income' | 'expense' | 'others-in' | 'others-out';
}

export interface Transaction {
  id: string;
  date: string;
  time?: string;  // HH:mm — optional, for display purposes
  amount: number;
  type: 'income' | 'expense' | 'others-in' | 'others-out';
  accountType: 'bank' | 'card' | 'cash' | 'others' | 'wallet';
  accountId: string;
  categoryId: string;
  notes: string;
}

export interface Settings {
  currency: string;
  passwordEnabled?: boolean;
}

export interface FixedDeposit {
  id: string;
  bankId: string; // Serves as 'From Bank'
  toBankId?: string; // New field for 'To Bank'
  startDate: string;
  amount: number;
  percentage: number; // annual interest rate
  months: number;
  status: 'active' | 'matured' | 'withdrawn';
}

export interface RecurringTransaction {
  id: string;
  startDate: string; // YYYY-MM-DD
  months: number; // recurring for how many months
  amount: number;
  accountType: 'bank' | 'wallet' | 'card';
  accountId: string;
  categoryId: string;
  notes: string; // remarks
  active: boolean;
  triggeredCount: number; // starts at 0, goes up to months
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
  fixedDeposits: FixedDeposit[];
  recurringTransactions?: RecurringTransaction[];
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
      // --- INCOME (True Wealth Increase) ---
      { id: generateUUID(), name: 'Salary', color: '#22C55E', type: 'income' },
      { id: generateUUID(), name: 'Dividend Gain', color: '#10B981', type: 'income' },
      { id: generateUUID(), name: 'Investment Profit', color: '#0D9488', type: 'income' },
      { id: generateUUID(), name: 'Rental Income', color: '#0EA5E9', type: 'income' },
      { id: generateUUID(), name: 'Others (Income)', color: '#94A3B8', type: 'income' },

      // --- EXPENSES (True Wealth Decrease) ---
      { id: generateUUID(), name: 'Food & Drink', color: '#F97316', type: 'expense' },
      { id: generateUUID(), name: 'Grocery', color: '#F59E0B', type: 'expense' },
      { id: generateUUID(), name: 'Bills & Utilities', color: '#3B82F6', type: 'expense' },
      { id: generateUUID(), name: 'Petrol & Transport', color: '#B45309', type: 'expense' },
      { id: generateUUID(), name: 'Toll', color: '#B45309', type: 'expense' },
      { id: generateUUID(), name: 'Health & Medical', color: '#EC4899', type: 'expense' },
      { id: generateUUID(), name: 'Entertainment', color: '#8B5CF6', type: 'expense' },
      { id: generateUUID(), name: 'Travel', color: '#06B6D4', type: 'expense' },
      { id: generateUUID(), name: 'Work Expenses', color: '#4B5563', type: 'expense' },
      { id: generateUUID(), name: 'Shopping', color: '#D97706', type: 'expense' },
      { id: generateUUID(), name: 'Others (Expense)', color: '#9CA3AF', type: 'expense' },

      // --- TRANSFERS (Moving Money) ---
      // Math: "In" adds to account, "Out" subtracts. Net impact on net worth: 0.
      { id: generateUUID(), name: 'Transfer (In)', color: '#6366F1', type: 'others-in' },
      { id: generateUUID(), name: 'Transfer (Out)', color: '#4338CA', type: 'others-out' },
      { id: generateUUID(), name: 'Bank Withdrawal', color: '#64748B', type: 'others-out' },
      { id: generateUUID(), name: 'Credit Card Payment', color: '#1E40AF', type: 'others-out' },

      // --- ASSET REALLOCATION ---
      { id: generateUUID(), name: 'Investment (In)', color: '#14B8A6', type: 'others-in' },
      { id: generateUUID(), name: 'Investment (Out)', color: '#0F766E', type: 'others-out' },
      { id: generateUUID(), name: 'Fixed Deposit (In)', color: '#059669', type: 'others-in' },
      { id: generateUUID(), name: 'Fixed Deposit (Out)', color: '#047857', type: 'others-out' },

      // --- ADJUSTMENTS (Syncing Balances) ---
      // Used to manually fix account balances to match real life
      { id: generateUUID(), name: 'Adjustment (In)', color: '#94A3B8', type: 'others-in' },
      { id: generateUUID(), name: 'Adjustment (Out)', color: '#475569', type: 'others-out' }
    ],
    transactions: [],
    fixedDeposits: [],
    recurringTransactions: []
  };

  // State signals
  readonly state = signal<AppState>(this.deepCopy(this.initialState));
  readonly isDirty = signal<boolean>(false);
  readonly isLoggedIn = signal<boolean>(false);
  /** Password held in memory for SPW3 export; never persisted. */
  readonly filePassword = signal<string | null>(null);
  /** Original filename of the loaded .spw file; null for new users. */
  readonly loadedFilename = signal<string | null>(null);

  setFilePassword(password: string | null) {
    this.filePassword.set(password);
  }

  setLoadedFilename(name: string | null) {
    this.loadedFilename.set(name);
  }

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

    // Migration: Convert initial capital to transactions for banks and wallets
    // We only do this if it hasn't been done before (i.e. if initialCapital > 0)
    if (newState.banks) {
      newState.banks.forEach(bank => {
        if (bank.initialCapital !== 0) {
          const hasAdj = newState.transactions?.some(t => t.accountId === bank.id && t.notes === 'Initial balance');
          if (!hasAdj) {
            const adjIn = newState.categories?.find(c => c.name === 'Adjustment (In)');
            const now = new Date();
            const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const newT: Transaction = {
              id: generateUUID(),
              date: localDate,
              time: '00:00',
              amount: bank.initialCapital,
              type: 'others-in',
              accountType: 'bank',
              accountId: bank.id,
              categoryId: adjIn ? adjIn.id : '',
              notes: 'Initial balance'
            };
            if (!newState.transactions) newState.transactions = [];
            newState.transactions.push(newT);
          }
          // Set to 0 so it's not counted twice and migration doesn't run again
          bank.initialCapital = 0;
        }
      });
    }

    if (newState.wallets) {
      newState.wallets.forEach(wallet => {
        if (wallet.initialCapital !== 0) {
          const hasAdj = newState.transactions?.some(t => t.accountId === wallet.id && t.notes === 'Initial balance');
          if (!hasAdj) {
            const adjIn = newState.categories?.find(c => c.name === 'Adjustment (In)');
            const now = new Date();
            const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const newT: Transaction = {
              id: generateUUID(),
              date: localDate,
              time: '00:00',
              amount: wallet.initialCapital,
              type: 'others-in',
              accountType: 'wallet',
              accountId: wallet.id,
              categoryId: adjIn ? adjIn.id : '',
              notes: 'Initial balance'
            };
            if (!newState.transactions) newState.transactions = [];
            newState.transactions.push(newT);
          }
          wallet.initialCapital = 0;
        }
      });
    }

    // Migration: Convert isMatured to status for fixed deposits
    if (newState.fixedDeposits) {
      newState.fixedDeposits.forEach((fd: any) => {
        if (!fd.status) {
          fd.status = fd.isMatured ? 'matured' : 'active';
          delete fd.isMatured;
        }
      });
    }

    if (!newState.recurringTransactions) {
      newState.recurringTransactions = [];
    }

    let hasChanges = false;

    // Auto-trigger active recurring transactions scheduled for today on load
    if (newState.recurringTransactions && newState.recurringTransactions.length > 0) {
      const now = new Date();
      const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const localTime = now.toTimeString().slice(0, 8); // HH:mm:ss

      newState.recurringTransactions.forEach(rt => {
        if (rt.active && rt.triggeredCount < rt.months) {
          const targetDate = this.addMonthsToDate(rt.startDate, rt.triggeredCount);
          if (targetDate === todayStr) {
            // Check for double trigger to prevent duplicating if file is re-loaded in the same day
            const hasDoubleTrigger = newState.transactions?.some(t =>
              t.date === todayStr &&
              t.accountId === rt.accountId &&
              t.accountType === rt.accountType &&
              t.categoryId === rt.categoryId &&
              t.amount === rt.amount &&
              t.notes === rt.notes
            );

            if (!hasDoubleTrigger) {
              const category = newState.categories?.find(c => c.id === rt.categoryId);
              const categoryType = category?.type || 'expense';

              const newT: Transaction = {
                id: generateUUID(),
                date: todayStr,
                time: localTime,
                amount: rt.amount,
                type: categoryType,
                accountType: rt.accountType,
                accountId: rt.accountId,
                categoryId: rt.categoryId,
                notes: rt.notes
              };

              if (!newState.transactions) newState.transactions = [];
              newState.transactions.push(newT);

              rt.triggeredCount += 1;
              if (rt.triggeredCount >= rt.months) {
                rt.active = false;
              }
              hasChanges = true;
            }
          }
        }
      });
    }

    const normalizedState = {
      ...this.deepCopy(this.initialState),
      ...newState
    };
    this.state.set(normalizedState);
    this.isDirty.set(hasChanges);
    this.isLoggedIn.set(true);
  }

  startNewUser() {
    this.setState(this.deepCopy(this.initialState));
    this.isDirty.set(true);
    this.loadedFilename.set(null);
  }

  logout() {
    this.state.set(this.deepCopy(this.initialState));
    this.isDirty.set(false);
    this.isLoggedIn.set(false);
    this.filePassword.set(null);
    this.loadedFilename.set(null);
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
    const bankId = generateUUID();
    const newBank: Bank = { ...bank, id: bankId };

    this.state.set({ ...current, banks: [...current.banks, newBank] });

    // Add adjustment transaction for initial capital
    if (Number(bank.initialCapital) !== 0) {
      this.addAdjustmentTransaction('bank', bankId, Number(bank.initialCapital), 'Initial balance');
    }

    this.isDirty.set(true);
  }

  updateBank(id: string, bank: Partial<Bank>) {
    let current = this.state();
    const oldBank = current.banks.find(b => b.id === id);

    // First update the bank details
    this.state.set({
      ...current,
      banks: current.banks.map(b => b.id === id ? { ...b, ...bank } : b)
    });

    // Then update the Initial balance transaction instead of adding a diff
    if (oldBank && bank.initialCapital !== undefined && Number(bank.initialCapital) !== Number(oldBank.initialCapital)) {
      current = this.state();
      const newCapital = Number(bank.initialCapital);
      const initTx = (current.transactions || []).find(t =>
        t.accountType === 'bank' && t.accountId === id && t.notes === 'Initial balance'
      );
      if (initTx) {
        if (newCapital === 0) {
          this.state.set({
            ...current,
            transactions: (current.transactions || []).filter(t => t.id !== initTx.id)
          });
        } else {
          this.state.set({
            ...current,
            transactions: (current.transactions || []).map(t =>
              t.id === initTx.id ? { ...t, amount: newCapital, type: 'others-in' as const } : t
            )
          });
        }
      } else if (newCapital !== 0) {
        this.addAdjustmentTransaction('bank', id, newCapital, 'Initial balance');
      }
    }

    this.isDirty.set(true);
  }

  deleteBank(id: string) {
    let current = this.state();

    const balance = this.getAccountBalance('bank', id);
    if (balance !== 0) {
      this.addAdjustmentTransaction('bank', id, -balance, 'Account closure adjustment');
    }

    current = this.state();
    this.state.set({ ...current, banks: current.banks.filter(b => b.id !== id) });
    this.isDirty.set(true);
  }

  // --- Wallets ---
  addWallet(wallet: Omit<Wallet, 'id'>) {
    const current = this.state();
    const walletId = generateUUID();
    const newWallet: Wallet = { ...wallet, id: walletId };

    this.state.set({ ...current, wallets: [...(current.wallets || []), newWallet] });

    // Add adjustment transaction
    if (Number(wallet.initialCapital) !== 0) {
      this.addAdjustmentTransaction('wallet', walletId, Number(wallet.initialCapital), 'Initial balance');
    }

    this.isDirty.set(true);
  }

  updateWallet(id: string, wallet: Partial<Wallet>) {
    let current = this.state();
    const oldWallet = (current.wallets || []).find(w => w.id === id);

    // First update the wallet details
    this.state.set({
      ...current,
      wallets: (current.wallets || []).map(w => w.id === id ? { ...w, ...wallet } : w)
    });

    // Then update the Initial balance transaction instead of adding a diff
    if (oldWallet && wallet.initialCapital !== undefined && Number(wallet.initialCapital) !== Number(oldWallet.initialCapital)) {
      current = this.state();
      const newCapital = Number(wallet.initialCapital);
      const initTx = (current.transactions || []).find(t =>
        t.accountType === 'wallet' && t.accountId === id && t.notes === 'Initial balance'
      );
      if (initTx) {
        if (newCapital === 0) {
          this.state.set({
            ...current,
            transactions: (current.transactions || []).filter(t => t.id !== initTx.id)
          });
        } else {
          this.state.set({
            ...current,
            transactions: (current.transactions || []).map(t =>
              t.id === initTx.id ? { ...t, amount: newCapital, type: 'others-in' as const } : t
            )
          });
        }
      } else if (newCapital !== 0) {
        this.addAdjustmentTransaction('wallet', id, newCapital, 'Initial balance');
      }
    }

    this.isDirty.set(true);
  }

  deleteWallet(id: string) {
    let current = this.state();

    const balance = this.getAccountBalance('wallet', id);
    if (balance !== 0) {
      this.addAdjustmentTransaction('wallet', id, -balance, 'Account closure adjustment');
    }

    current = this.state();
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
  addCategory(name: string, color?: string, type?: 'income' | 'expense' | 'others-in' | 'others-out') {
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

  // --- Fixed Deposits ---
  addFixedDeposit(fd: Omit<FixedDeposit, 'id'>) {
    const current = this.state();
    const newFD: FixedDeposit = { ...fd, id: generateUUID() };
    this.state.set({ ...current, fixedDeposits: [...(current.fixedDeposits || []), newFD] });
    this.isDirty.set(true);
  }

  updateFixedDeposit(id: string, updates: Partial<FixedDeposit>) {
    const current = this.state();
    this.state.set({
      ...current,
      fixedDeposits: (current.fixedDeposits || []).map(f => f.id === id ? { ...f, ...updates } : f)
    });
    this.isDirty.set(true);
  }

  deleteFixedDeposit(id: string) {
    const current = this.state();
    this.state.set({ ...current, fixedDeposits: (current.fixedDeposits || []).filter(f => f.id !== id) });
    this.isDirty.set(true);
  }

  // --- Recurring Transactions ---
  addRecurringTransaction(rt: Omit<RecurringTransaction, 'id' | 'triggeredCount'>) {
    const current = this.state();
    const newRT: RecurringTransaction = {
      ...rt,
      id: generateUUID(),
      triggeredCount: 0
    };
    this.state.set({
      ...current,
      recurringTransactions: [...(current.recurringTransactions || []), newRT]
    });
    this.isDirty.set(true);
  }

  updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>) {
    const current = this.state();
    this.state.set({
      ...current,
      recurringTransactions: (current.recurringTransactions || []).map(r => r.id === id ? { ...r, ...updates } : r)
    });
    this.isDirty.set(true);
  }

  deleteRecurringTransaction(id: string) {
    const current = this.state();
    this.state.set({
      ...current,
      recurringTransactions: (current.recurringTransactions || []).filter(r => r.id !== id)
    });
    this.isDirty.set(true);
  }

  triggerRecurringTransaction(id: string) {
    const current = this.state();
    const rt = (current.recurringTransactions || []).find(r => r.id === id);
    if (!rt) return;

    if (rt.triggeredCount >= rt.months) {
      alert('This recurring transaction has already been fully triggered for all months.');
      return;
    }

    // Determine target date
    const targetDate = this.addMonthsToDate(rt.startDate, rt.triggeredCount);

    // Determine category type
    const category = current.categories.find(c => c.id === rt.categoryId);
    const categoryType = category?.type || 'expense';

    // Auto-capture current time
    const now = new Date();
    const localTime = now.toTimeString().slice(0, 8); // HH:mm:ss

    // Create the transaction
    const newT: Transaction = {
      id: generateUUID(),
      date: targetDate,
      time: localTime,
      amount: rt.amount,
      type: categoryType,
      accountType: rt.accountType,
      accountId: rt.accountId,
      categoryId: rt.categoryId,
      notes: rt.notes
    };

    // Update state with new transaction and incremented triggeredCount
    const nextTriggeredCount = rt.triggeredCount + 1;
    const isCompleted = nextTriggeredCount >= rt.months;

    this.state.set({
      ...current,
      transactions: [...(current.transactions || []), newT],
      recurringTransactions: (current.recurringTransactions || []).map(r =>
        r.id === id ? { ...r, triggeredCount: nextTriggeredCount, active: isCompleted ? false : r.active } : r
      )
    });
    this.isDirty.set(true);
  }

  private addMonthsToDate(dateStr: string, monthsOffset: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1 + monthsOffset, 1);
    const maxDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(day, maxDays);
    date.setDate(targetDay);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(targetDay).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private addAdjustmentTransaction(accountType: Transaction['accountType'], accountId: string, amount: number, notes: string) {
    const current = this.state();
    const isPositive = amount >= 0;
    const absAmount = Math.abs(amount);

    const categories = current.categories || [];
    const categoryName = isPositive ? 'Adjustment (In)' : 'Adjustment (Out)';
    const category = categories.find(c => c.name === categoryName);

    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const localTime = now.toTimeString().slice(0, 5);

    const newTransaction: Transaction = {
      id: generateUUID(),
      date: localDate,
      time: localTime,
      amount: absAmount,
      type: isPositive ? 'others-in' : 'others-out',
      accountType,
      accountId,
      categoryId: category ? category.id : '',
      notes: notes
    };

    this.state.set({
      ...current,
      transactions: [...(current.transactions || []), newTransaction]
    });
  }

  private getAccountBalance(accountType: 'bank' | 'wallet', accountId: string): number {
    const current = this.state();
    const transactions = current.transactions || [];
    let balance = 0;

    for (const t of transactions) {
      if (t.accountType === accountType && t.accountId === accountId) {
        if (t.type === 'income' || t.type === 'others-in') balance += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') balance -= t.amount;
      }
    }

    return balance;
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
