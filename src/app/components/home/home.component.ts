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
import { Chat } from '../../models/chat.model';

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

  chats: Chat[] = [];
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
    //console.warn(this.user);
    //console.warn(localStorage.getItem('access_token'));

    // fetch user chats
    this.getRooms();
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

  getRooms(){
    this.chatService.getChatRooms(this.user.id).subscribe({
      next: (data) => {
        this.chats = data;
      },
      error: (err) => {},
      complete: () => {
        //console.warn(this.chats);
      }
    });
  }

  navigateToChat(c :any) {
    this.router.navigate(['/chats', c.id]);
    this.selectedChat = c;
    //console.warn(this.selectedChat);
    localStorage.setItem("selectedChat", JSON.stringify(c));
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
