import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingService } from '../parking';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-list.html', // Achte darauf, dass der Dateiname stimmt
})
export class ParkingListComponent implements OnInit {
  stations: any[] = [];

  constructor(private ps: ParkingService) {}

 ngOnInit() {
  this.ps.getStations().subscribe({
    next: (res: any) => {
      console.log('Daten erhalten:', res); // Das zeigt dir die Daten in der F12 Konsole
      this.stations = res.data;
    },
    error: (err) => {
      console.error('Fehler beim Laden:', err); // Das zeigt dir den Fehler
    }
  });
}
}
