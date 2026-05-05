import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';

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
  
  banks = computed(() => this.stateService.state().banks);

  constructor(
    public router: Router,
    public stateService: StateService
  ) {}

  addBank() {
    if (this.newBankName && this.newBankCapital !== null) {
      this.stateService.addBank({
        name: this.newBankName,
        initialCapital: this.newBankCapital
      });
      this.newBankName = '';
      this.newBankCapital = null;
    }
  }

  deleteBank(id: string) {
    if (confirm('Are you sure you want to remove this bank?')) {
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
        if (t.type === 'income') balance += t.amount;
        if (t.type === 'expense') balance -= t.amount;
      }
    }
    
    return balance;
  }
}
