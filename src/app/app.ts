import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  darkMode = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.darkMode = localStorage.getItem('a22-theme') === 'dark';
    document.body.classList.toggle('dark', this.darkMode);
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('a22-theme', this.darkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark', this.darkMode);
  }
}
