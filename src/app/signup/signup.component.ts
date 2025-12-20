import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Password, PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';

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
export class SignupComponent {

  confirmPassword: any = '';
  user: any = {
    username: '',
    email: '',
    password: ''
  }
  visible: boolean = false;

  register(user: any) {
    console.log(user);
    this.showDialog();
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
    }
  }

}
