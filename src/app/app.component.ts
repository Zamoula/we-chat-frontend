import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashScreenComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'we-chat';
  visible = true; // Renamed from showSplash

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    // Hide splash screen after 2.5 seconds
    setTimeout(() => {
      this.visible = false;
    }, 2500);
  }
}
// Re-compilation trigger
