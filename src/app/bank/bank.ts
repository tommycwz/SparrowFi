import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, getRandomColor } from '../services/state.service';

@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bank.html',
  styleUrls: ['./bank.scss']
})
export class BankComponent {
  newBankName = '';
  newBankCapital: number | null = null;
  newBankColor = getRandomColor();
  editingId: string | null = null;
  
  banks = computed(() => this.stateService.state().banks);

  constructor(
    public router: Router,
    public stateService: StateService
  ) {}

  addBank() {
    if (this.newBankName && this.newBankCapital !== null) {
      if (this.editingId) {
        const bank = this.banks().find(b => b.id === this.editingId);
        if (bank && bank.initialCapital !== this.newBankCapital) {
          if (!confirm('Warning: Changing the initial capital will affect your total balance and historical calculations on the dashboard. Do you want to continue?')) {
            return;
          }
        }
        this.stateService.updateBank(this.editingId, {
          name: this.newBankName,
          initialCapital: this.newBankCapital,
          color: this.newBankColor
        });
      } else {
        this.stateService.addBank({
          name: this.newBankName,
          initialCapital: this.newBankCapital,
          color: this.newBankColor
        });
      }
      this.resetForm();
    }
  }

  editBank(id: string) {
    const bank = this.banks().find(b => b.id === id);
    if (bank) {
      this.editingId = id;
      this.newBankName = bank.name;
      this.newBankCapital = bank.initialCapital;
      this.newBankColor = bank.color || getRandomColor();
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingId = null;
    this.newBankName = '';
    this.newBankCapital = null;
    this.newBankColor = getRandomColor();
  }

  deleteBank(id: string) {
    if (confirm('Are you sure you want to remove this bank? This will affect your total balance and historical transactions associated with this account. This action cannot be undone. Do you want to continue?')) {
      this.stateService.deleteBank(id);
    }
  }

  getBankBalance(bankId: string): number {
    const bank = this.banks().find(b => b.id === bankId);
    if (!bank) return 0;
    
    let balance = bank.initialCapital;
    const transactions = this.stateService.state().transactions || [];
    
    for (const t of transactions) {
      if (t.accountType === 'bank' && t.accountId === bankId) {
        if (t.type === 'income' || t.type === 'others-in') balance += t.amount;
        if (t.type === 'expense' || t.type === 'others-out') balance -= t.amount;
      }
    }
    
    return balance;
  }
}
