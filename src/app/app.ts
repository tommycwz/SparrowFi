import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private stateService: StateService) {}

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.stateService.isDirty()) {
      $event.returnValue = true;
    }
  }
}
