import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService, getRandomColor } from '../services/state.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.scss']
})
export class WalletComponent {
  newWalletName = '';
  newWalletCapital: number | null = null;
  newWalletColor = getRandomColor();
  editingId: string | null = null;

  wallets = computed(() => this.stateService.state().wallets);

  constructor(
    public router: Router,
    public stateService: StateService
  ) {}

  addWallet() {
    if (this.newWalletName && this.newWalletCapital !== null) {
      if (this.editingId) {
        const wallet = this.wallets().find(w => w.id === this.editingId);
        if (wallet && wallet.initialCapital !== this.newWalletCapital) {
          if (!confirm('Warning: Changing the initial balance will affect your total balance and historical calculations on the dashboard. Do you want to continue?')) {
            return;
          }
        }
        this.stateService.updateWallet(this.editingId, {
          name: this.newWalletName,
          initialCapital: this.newWalletCapital,
          color: this.newWalletColor
        });
      } else {
        this.stateService.addWallet({
          name: this.newWalletName,
          initialCapital: this.newWalletCapital,
          color: this.newWalletColor
        });
      }
      this.resetForm();
    }
  }

  editWallet(id: string) {
    const wallet = this.wallets().find(w => w.id === id);
    if (wallet) {
      this.editingId = id;
      this.newWalletName = wallet.name;
      this.newWalletCapital = wallet.initialCapital;
      this.newWalletColor = wallet.color || getRandomColor();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingId = null;
    this.newWalletName = '';
    this.newWalletCapital = null;
    this.newWalletColor = getRandomColor();
  }

  deleteWallet(id: string) {
    if (confirm('Are you sure you want to remove this wallet? This will affect your total balance and historical transactions associated with this account. This action cannot be undone. Do you want to continue?')) {
      this.stateService.deleteWallet(id);
    }
  }

  getWalletBalance(walletId: string): number {
    const wallet = this.wallets().find(w => w.id === walletId);
    if (!wallet) return 0;

    let balance = wallet.initialCapital;
    const transactions = this.stateService.state().transactions || [];

    for (const t of transactions) {
      if (t.accountType === 'wallet' && t.accountId === walletId) {
        if (t.type === 'income') balance += t.amount;
        if (t.type === 'expense') balance -= t.amount;
      }
    }

    return balance;
  }
}
