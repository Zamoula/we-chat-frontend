import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ChatService } from '../../services/chat.service';

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
    AvatarGroup,
    Dialog,
    InputTextModule,
    FloatLabel,
    RadioButtonModule
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
  user: any;
  selectedChat?: Chat;
  visible: boolean = false;
  newChatName: string = '';
  newRoom_type: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    let u = localStorage.getItem('user');
    this.user = JSON.parse(u ?? '{}');
    console.warn(this.user);
    console.warn(localStorage.getItem('access_token'));

    // fetch user chats
    // subscribe to ws topics
  }

  createRoom() {
    const room = {
      name: this.newChatName,
      type: this.newRoom_type,
      participants: [this.user.id]
    };
    console.warn('ROOM FORM VALUE :',room);
    this.chatService.create(room).subscribe({
      next: data => {
        console.warn(data);
      }
    });

    //reset values
    this.newChatName = '';
    this.newRoom_type = 'PUBLIC'
    this.visible = false;
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

  showDialog() {
    this.visible = true;
  }

}
