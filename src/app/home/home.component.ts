import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { Router } from '@angular/router';

interface Chat {
  id: any,
  name: any,
  lastMessage: any,updatedAt: any, unread?: any
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ListboxModule,
    Avatar,
    AvatarGroup
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  chats: Chat[] = [
    {
      id: '1',
      name: 'Alice',
      lastMessage: 'See you later',
      updatedAt: new Date(),
      unread: 2
    },
    {
      id: '2',
      name: 'Dev Team',
      lastMessage: 'PR merged',
      updatedAt: new Date()
    }
  ];

  selectedChat?: Chat;

  constructor(private router: Router) {}

  ngOnInit(): void {
    let u = localStorage.getItem('user');
    console.warn(JSON.parse(u ?? '{}'));
    console.warn(localStorage.getItem('access_token'));
    
  }

  navigateToChat(id :any) {
    this.router.navigate(['/chats', id]);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  // helper methods
  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  }

}
