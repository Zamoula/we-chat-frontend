import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit{

  constructor(private router: Router) {}

  ngOnInit(): void {
    if(localStorage.getItem('access_token') || localStorage.getItem('user')) {
      this.router.navigate(['/home']);
    }
  }

  navigateToSignIn() {
    this.router.navigate(['/signin']);
  }
}
