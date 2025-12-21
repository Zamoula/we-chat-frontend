import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

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
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if(localStorage.getItem('access_token') || localStorage.getItem('user')) {
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
      username: this.email,
      password: this.password
    };
    console.warn('FORM VALUE :', user);
    this.authService.login(user).subscribe({
      next: data => {
        localStorage.setItem('access_token', data.jwt_token);
      },
      complete: () => {
        this.userService.getInfo().subscribe({
          next: data => {
            localStorage.setItem('user', JSON.stringify(data));
          }});
          this.router.navigate(['/home']);
      }
    });
  }
}