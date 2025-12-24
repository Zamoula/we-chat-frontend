import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
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
        DividerModule,
        DialogModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit{

  confirmPassword: any = '';
  user: any = {
    username: '',
    email: '',
    password: ''
  }
  visible: boolean = false;
  errorMessage: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if(localStorage.getItem('access_token') && localStorage.getItem('user')) {
      this.router.navigate(['/home']);
    }
  }

  register(user: any) {
    this.authService.register(user).subscribe({
      next: data => {
        this.showDialog();
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      },
      error: err => {
        this.errorMessage = true;
      },
      complete: () => {}
    });
  }

  //helper methods
  checkForm(): boolean {
    return this.user.password == this.confirmPassword 
      && this.user.username != ''
      && this.user.email != ''
      && this.user.password != '';
  }

  showDialog() {
    this.visible = true;
  }

  onType(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.length == 8) {
      this.visible = false;
      this.router.navigate(['/home']);
    }
  }

}
