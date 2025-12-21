import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chat.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { messages } from '../../mock_data/messages.data';
import { timestamp } from 'rxjs';

@Component({
  selector: 'app-chat-details',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './chat-details.component.html',
  styleUrl: './chat-details.component.scss'
})
export class ChatDetailsComponent implements OnInit, AfterViewInit{

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  chat: any;
  message: any = '';
  messages: any[] = messages;

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.chat = JSON.parse(localStorage.getItem("selectedChat") ?? '{}');
    console.warn(this.chat);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.message.trim()) return;

    let m = {
      sender: {id: 555, username: "Jamel M'rad" },
      chat: {id: 101},
      content: this.message,
      type: 'TEXT',
      timestamp: new Date()
    }

    console.warn(m);
    this.messages.push(m);
    (this.message); // send via WS / HTTP
    this.message = '';

    this.scrollToBottom();
  }

  // helper methods
  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  }

  formatTimestamp(timestamp: Date | string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return time; // e.g. 18:42
    }

    const day = date.toLocaleDateString([], {
      weekday: 'short'
    });

    return `${day} ${time}`; // e.g. Mon 18:42
  }

  verifSender(sender: any): boolean{
    let userString = localStorage.getItem("user");
    let user = JSON.parse(userString ?? '{}');

    return sender == user.username;
  }

  scrollToBottom(): void {
    try {
      // Use setTimeout to ensure DOM has updated with the new message
      setTimeout(() => {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }, 0);
    } catch(err) { 
      console.error('Error scrolling to bottom:', err);
    }
  }
}
