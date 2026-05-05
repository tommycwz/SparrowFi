import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.html',
  styleUrls: ['./category.scss']
})
export class CategoryComponent {
  newCategoryName = '';
  
  categories = computed(() => this.stateService.state().categories || []);

  constructor(public stateService: StateService) {}

  addCategory() {
    if (this.newCategoryName.trim()) {
      this.stateService.addCategory(this.newCategoryName.trim());
      this.newCategoryName = '';
    }
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category? Any transactions using it will lose their category reference.')) {
      this.stateService.deleteCategory(id);
    }
  }
}
