import { Component, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, FixedDeposit } from '../services/state.service';

@Component({
  selector: 'app-fixed-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fixed-deposit.html',
  styleUrls: ['./fixed-deposit.scss'],
  providers: [DecimalPipe]
})
export class FixedDepositComponent {
  newBankId = '';
  newStartDate = new Date().toISOString().split('T')[0];
  newAmount: number | null = null;
  newPercentage: number | null = null;
  newMonths: number | null = null;
  editingId: string | null = null;

  banks = computed(() => this.stateService.state().banks);
  fixedDeposits = computed(() => this.stateService.state().fixedDeposits || []);

  constructor(
    public router: Router,
    public stateService: StateService
  ) {}

  getProjectedAmount(): number {
    if (this.newAmount !== null && this.newPercentage !== null && this.newMonths !== null) {
      return this.newAmount + (this.newAmount * (this.newPercentage / 100) * (this.newMonths / 12));
    }
    return 0;
  }

  getProjectedAmountFor(fd: FixedDeposit): number {
    return fd.amount + (fd.amount * (fd.percentage / 100) * (fd.months / 12));
  }

  getMaturityDate(fd: FixedDeposit): Date {
    const date = new Date(fd.startDate);
    date.setMonth(date.getMonth() + fd.months);
    return date;
  }

  getMaturityDatePreview(): Date | null {
    if (this.newStartDate && this.newMonths) {
      const date = new Date(this.newStartDate);
      date.setMonth(date.getMonth() + this.newMonths);
      return date;
    }
    return null;
  }

  createFixedDeposit() {
    if (this.newBankId && this.newStartDate && this.newAmount !== null && this.newPercentage !== null && this.newMonths !== null) {
      if (this.editingId) {
        this.stateService.updateFixedDeposit(this.editingId, {
          bankId: this.newBankId,
          startDate: this.newStartDate,
          amount: this.newAmount,
          percentage: this.newPercentage,
          months: this.newMonths
        });
      } else {
        // Create FD record
        const fdData: Omit<FixedDeposit, 'id'> = {
          bankId: this.newBankId,
          startDate: this.newStartDate,
          amount: this.newAmount,
          percentage: this.newPercentage,
          months: this.newMonths,
          status: 'active'
        };
        this.stateService.addFixedDeposit(fdData);

        // Add deduction transaction
        let categoryId = '';
        const categories = this.stateService.state().categories;
        const fdInCategory = categories.find(c => c.name.toLowerCase().includes('fixed deposit (in)'));
        
        if (fdInCategory) {
          categoryId = fdInCategory.id;
        }

        this.stateService.addTransaction({
          date: this.newStartDate,
          time: new Date().toTimeString().slice(0, 5),
          amount: this.newAmount,
          type: 'others-out', 
          accountType: 'bank',
          accountId: this.newBankId,
          categoryId: categoryId,
          notes: `Fixed Deposit Placement (${this.newMonths} months @ ${this.newPercentage}%)`
        });
      }

      this.resetForm();
    }
  }

  resetForm() {
    this.newBankId = '';
    this.newStartDate = new Date().toISOString().split('T')[0];
    this.newAmount = null;
    this.newPercentage = null;
    this.newMonths = null;
    this.editingId = null;
  }

  editFixedDeposit(fd: FixedDeposit) {
    this.editingId = fd.id;
    this.newBankId = fd.bankId;
    this.newStartDate = fd.startDate;
    this.newAmount = fd.amount;
    this.newPercentage = fd.percentage;
    this.newMonths = fd.months;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteFixedDeposit(id: string) {
    const fd = this.fixedDeposits().find(f => f.id === id);
    if (!fd || fd.status === 'active') {
      alert('Active deposits cannot be deleted. Please withdraw or mature them first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this fixed deposit record? This will NOT automatically reverse any transactions.')) {
      this.stateService.deleteFixedDeposit(id);
    }
  }

  matureFixedDeposit(fd: FixedDeposit) {
    if (confirm('Are you sure you want to mark this fixed deposit as matured? This will return the funds to your bank.')) {
      // Mark as matured
      this.stateService.updateFixedDeposit(fd.id, { status: 'matured' });

      // Calculate gain
      const gain = (fd.amount * (fd.percentage / 100) * (fd.months / 12));

      // Add return transaction (Principal)
      const categories = this.stateService.state().categories;
      const fdOutCategory = categories.find(c => c.name.toLowerCase().includes('fixed deposit (out)'));
      let principalCatId = fdOutCategory ? fdOutCategory.id : '';

      this.stateService.addTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        amount: fd.amount,
        type: 'others-in', // Returns to bank, so it adds to balance
        accountType: 'bank',
        accountId: fd.bankId,
        categoryId: principalCatId,
        notes: `Fixed Deposit Matured (Principal)`
      });

      // Add gain transaction (Investment Profit)
      const profitCategory = categories.find(c => c.name.toLowerCase().includes('investment profit'));
      let profitCatId = profitCategory ? profitCategory.id : '';

      this.stateService.addTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        amount: gain,
        type: 'income',
        accountType: 'bank',
        accountId: fd.bankId,
        categoryId: profitCatId,
        notes: `Fixed Deposit Matured (Interest Gain)`
      });
    }
  }

  withdrawFixedDeposit(fd: FixedDeposit) {
    if (confirm('Are you sure you want to withdraw this fixed deposit? This will return the principal to your bank without any interest gain.')) {
      // Mark as withdrawn
      this.stateService.updateFixedDeposit(fd.id, { status: 'withdrawn' });

      // Add return transaction (Principal only)
      const categories = this.stateService.state().categories;
      const fdOutCategory = categories.find(c => c.name.toLowerCase().includes('fixed deposit (out)'));
      let principalCatId = fdOutCategory ? fdOutCategory.id : '';

      this.stateService.addTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        amount: fd.amount,
        type: 'others-in', // Returns to bank
        accountType: 'bank',
        accountId: fd.bankId,
        categoryId: principalCatId,
        notes: `Fixed Deposit Withdrawal (Principal Only)`
      });
    }
  }

  getBankName(bankId: string): string {
    const bank = this.banks().find(b => b.id === bankId);
    return bank ? bank.name : 'Unknown Bank';
  }
}
