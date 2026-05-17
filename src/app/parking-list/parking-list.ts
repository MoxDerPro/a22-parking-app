import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ParkingService } from '../parking';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-list.html', // Achte darauf, dass der Dateiname stimmt
})
export class ParkingListComponent implements OnInit {
  stations: any[] = [];
  loading = true;
  error: string | null = null;
  selectedStation: any | null = null;
  selectedTab: 'all' | 'favorites' = 'all';
  favorites = new Set<string>();
  private readonly favoritesKey = 'a22-parking-favorites';

  constructor(
    private ps: ParkingService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.loadFavorites();
  }

  ngOnInit() {
    this.ps.getStations().subscribe({
      next: (res: any) => {
        console.log('Daten erhalten:', res); // Das zeigt dir die Daten in der F12 Konsole
        this.stations = res?.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fehler beim Laden:', err); // Das zeigt dir den Fehler
        this.error = err?.message ?? 'Fehler beim Laden der Daten';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadFavorites() {
    try {
      const raw = localStorage.getItem(this.favoritesKey);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        if (Array.isArray(ids)) {
          ids.forEach((id) => this.favorites.add(id));
        }
      }
    } catch {
      // Wenn localStorage nicht verfügbar ist, einfach ohne Favoriten starten.
    }
  }

  private saveFavorites() {
    try {
      localStorage.setItem(this.favoritesKey, JSON.stringify(Array.from(this.favorites)));
    } catch {
      // Ignore storage errors.
    }
  }

  toggleFavorite(station: any) {
    const id = this.getStationId(station);
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    this.saveFavorites();
  }

  isFavorite(station: any): boolean {
    return this.favorites.has(this.getStationId(station));
  }

  get filteredStations(): any[] {
    if (this.selectedTab === 'favorites') {
      return this.stations.filter((station) => this.isFavorite(station));
    }
    return this.stations;
  }

  selectTab(tab: 'all' | 'favorites') {
    this.selectedTab = tab;
    this.selectedStation = null;
  }

  private getStationId(station: any): string {
    return station?.scode ?? station?.id ?? JSON.stringify(station);
  }

  toggleStation(station: any) {
    this.selectedStation = this.selectedStation === station ? null : station;
  }

  getStatusLabel(station: any): string {
    if (station.savailable === true) {
      return 'Plätze verfügbar';
    }
    if (station.savailable === false) {
      return 'Besetzt';
    }
    return `${station.savailable} Plätze`;
  }

  getMapUrl(station: any): SafeResourceUrl | null {
    const coord = station?.scoordinate;
    if (!coord || coord.x == null || coord.y == null) {
      return null;
    }

    const lon = coord.x;
    const lat = coord.y;
    const delta = 0.01;
    const left = lon - delta;
    const right = lon + delta;
    const bottom = lat - delta;
    const top = lat + delta;

    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

