import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ParkingListComponent } from './parking-list/parking-list';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'parkplaetze', component: ParkingListComponent },
  { path: '**', redirectTo: '' }
];
