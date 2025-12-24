import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit{
  email: any = '';
  password: any = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if(localStorage.getItem('access_token') && localStorage.getItem('user')) {
      this.router.navigate(['/home']);
    }
  }

  //helper methods
  checkForm(): boolean {
    return this.email != ''
      && this.password != '';
  }

  login() {
    const user = {
      email: this.email,
      password: this.password
    };
    this.authService.login(user).subscribe({
      next: data => {
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      },
      complete: () => {
        this.router.navigate(['/home']);
      }
    });
  }
}