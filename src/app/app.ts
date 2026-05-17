import { Component } from '@angular/core';
import { ParkingListComponent } from './parking-list/parking-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ParkingListComponent],
  templateUrl: './app.html',    // Nur app.html, da kein ".component" im Namen
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'my-parking-app';
}
