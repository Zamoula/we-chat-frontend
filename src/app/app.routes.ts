import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';

import { HomeComponent } from './components/home/home.component';
import { ChatDetailsComponent } from './components/chat-details/chat-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { ConnectedDevicesComponent } from './components/connected-devices/connected-devices.component';
import { ActiveSessionsComponent } from './components/active-sessions/active-sessions.component';

export const routes: Routes = [
    { path: "", component: LandingComponent },
    { path: "signin", component: SigninComponent },
    { path: "signup", component: SignupComponent },
    { path: "home", component: HomeComponent },
    { path: "chats/:id", component: ChatDetailsComponent },
    { path: "profile", component: ProfileComponent },
    { path: "settings", component: SettingsComponent },
    { path: "connected-devices", component: ConnectedDevicesComponent },
    { path: "active-sessions", component: ActiveSessionsComponent }
];
