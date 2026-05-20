import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ParkingService } from '../parking';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-list.html',
  styleUrls: ['./parking-list.css'],
})
export class ParkingListComponent implements OnInit, OnDestroy {
  stations: any[] = [];
  loading = true;
  error: string | null = null;
  selectedStation: any | null = null;
  selectedTab: 'all' | 'favorites' | 'map' = 'all';
  searchQuery = '';
  lastUpdated: Date | null = null;
  favorites = new Set<string>();
  private readonly favoritesKey = 'a22-parking-favorites';

  private readonly messageHandler = (event: MessageEvent) => {
    if (event.data?.type !== 'parking-select') return;
    const station = this.stations.find((s) => this.getStationId(s) === event.data.id);
    if (!station) return;
    this.selectedTab = 'all';
    this.selectedStation = station;
    this.cdr.detectChanges();
    setTimeout(() => {
      document.getElementById('station-' + event.data.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  constructor(
    private ps: ParkingService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.loadFavorites();
  }

  ngOnInit() {
    window.addEventListener('message', this.messageHandler);
    this.ps.getStations().subscribe({
      next: (res: any) => {
        this.stations = res?.data ?? [];
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message ?? 'Fehler beim Laden der Daten';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
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
      // ignore
    }
  }

  private saveFavorites() {
    try {
      localStorage.setItem(this.favoritesKey, JSON.stringify(Array.from(this.favorites)));
    } catch {
      // ignore
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
    let list = this.selectedTab === 'favorites'
      ? this.stations.filter((s) => this.isFavorite(s))
      : this.stations;
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((s) =>
        (s.sname ?? '').toLowerCase().includes(q) ||
        (s.scode ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  selectTab(tab: 'all' | 'favorites' | 'map') {
    this.selectedTab = tab;
    this.selectedStation = null;
    this.searchQuery = '';
  }

  get mapMarkers(): Array<{ lat: number; lon: number; label: string; id: string }> {
    return this.stations
      .filter((station) => station?.scoordinate?.x != null && station?.scoordinate?.y != null)
      .map((station) => ({
        lat: station.scoordinate.y,
        lon: station.scoordinate.x,
        label: station.sname || station.scode || 'Parkplatz',
        id: this.getStationId(station)
      }));
  }

  get mapOverviewUrl(): SafeResourceUrl | null {
    const markers = this.mapMarkers;
    if (markers.length === 0) {
      return null;
    }
    try {
      sessionStorage.setItem('a22-parking-map-markers', JSON.stringify(markers));
    } catch {
      // ignore
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('/parking-map.html');
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
