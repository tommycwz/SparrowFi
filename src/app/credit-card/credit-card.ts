import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-credit-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-card.html',
  styleUrls: ['./credit-card.scss']
})
export class CreditCardComponent {
  newCardName = '';
  
  cards = computed(() => this.stateService.state().cards || []);

  constructor(public stateService: StateService) {}

  addCard() {
    if (this.newCardName) {
      this.stateService.addCard({
        name: this.newCardName
      });
      this.newCardName = '';
    }
  }

  deleteCard(id: string) {
    if (confirm('Are you sure you want to remove this card?')) {
      this.stateService.deleteCard(id);
    }
  }
}
