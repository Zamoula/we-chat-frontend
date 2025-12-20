import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "signin", component: SigninComponent},
    {path: "signup", component: SignupComponent}
];
