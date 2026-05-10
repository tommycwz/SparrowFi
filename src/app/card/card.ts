import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, getRandomColor } from '../services/state.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.html',
  styleUrls: ['./card.scss']
})
export class CardComponent {
  newCardName = '';
  newCardColor = getRandomColor();
  editingId: string | null = null;
  
  cards = computed(() => this.stateService.state().cards || []);

  constructor(public stateService: StateService) {}

  addCard() {
    if (this.newCardName) {
      if (this.editingId) {
        this.stateService.updateCard(this.editingId, {
          name: this.newCardName,
          color: this.newCardColor
        });
      } else {
        this.stateService.addCard({
          name: this.newCardName,
          color: this.newCardColor
        });
      }
      this.resetForm();
    }
  }

  editCard(id: string) {
    const card = this.cards().find(c => c.id === id);
    if (card) {
      this.editingId = id;
      this.newCardName = card.name;
      this.newCardColor = card.color || getRandomColor();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingId = null;
    this.newCardName = '';
    this.newCardColor = getRandomColor();
  }

  deleteCard(id: string) {
    if (confirm('Are you sure you want to remove this card?')) {
      this.stateService.deleteCard(id);
    }
  }
}
