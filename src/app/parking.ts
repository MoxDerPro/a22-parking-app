import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private url = 'https://mobility.api.opendatahub.com/v2/flat,node/ParkingStation';

  constructor(private http: HttpClient) {}

  getStations(): Observable<any> {
  // Wir fügen Parameter hinzu, um sicherzugehen, dass wir die richtigen Daten vom A22 Datensatz bekommen
  const url = 'https://mobility.api.opendatahub.com/v2/flat,node/ParkingStation?where=sorigin.eq.%22A22%22';
  return this.http.get(url);
}
}
