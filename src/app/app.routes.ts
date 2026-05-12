import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.LoginComponent) },
  { 
    path: '', 
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'transaction', loadComponent: () => import('./transaction/transaction').then(m => m.TransactionComponent) },
      { path: 'bank', loadComponent: () => import('./bank/bank').then(m => m.BankComponent) },
      { path: 'wallet', loadComponent: () => import('./wallet/wallet').then(m => m.WalletComponent) },
      { path: 'card', loadComponent: () => import('./card/card').then(m => m.CardComponent) },
      { path: 'category', loadComponent: () => import('./category/category').then(m => m.CategoryComponent) },
      { path: 'fixed-deposit', loadComponent: () => import('./fixed-deposit/fixed-deposit').then(m => m.FixedDepositComponent) },
      { path: 'report', loadComponent: () => import('./report/report').then(m => m.ReportComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.SettingsComponent) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
