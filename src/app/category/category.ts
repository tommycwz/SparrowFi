import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, getRandomColor } from '../services/state.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.html',
  styleUrls: ['./category.scss']
})
export class CategoryComponent {
  newCategoryName = '';
  newCategoryColor = getRandomColor();
  newCategoryType: 'income' | 'expense' | 'others-in' | 'others-out' = 'expense';
  activeTab: 'income' | 'expense' | 'others-in' | 'others-out' = 'income';
  editingId: string | null = null;
  
  categories = computed(() => this.stateService.state().categories || []);
  incomeCategories = computed(() => this.categories().filter(c => c.type === 'income'));
  expenseCategories = computed(() => this.categories().filter(c => c.type === 'expense'));
  othersInCategories = computed(() => this.categories().filter(c => c.type === 'others-in'));
  othersOutCategories = computed(() => this.categories().filter(c => c.type === 'others-out'));

  constructor(public stateService: StateService) {}

  addCategory() {
    if (this.newCategoryName.trim()) {
      if (this.editingId) {
        this.stateService.updateCategory(this.editingId, {
          name: this.newCategoryName.trim(),
          color: this.newCategoryColor,
          type: this.newCategoryType
        });
      } else {
        this.stateService.addCategory(this.newCategoryName.trim(), this.newCategoryColor, this.newCategoryType);
      }
      this.resetForm();
    }
  }

  editCategory(id: string) {
    const cat = this.categories().find(c => c.id === id);
    if (cat) {
      this.editingId = id;
      this.newCategoryName = cat.name;
      this.newCategoryColor = cat.color || getRandomColor();
      this.newCategoryType = cat.type || 'expense';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingId = null;
    this.newCategoryName = '';
    this.newCategoryColor = getRandomColor();
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category? Any transactions using it will lose their category reference.')) {
      this.stateService.deleteCategory(id);
    }
  }

  randomizeColors() {
    this.stateService.randomizeAllCategoryColors();
  }
}
