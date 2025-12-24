import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/web-socket.service';
import { HttpClient } from '@angular/common/http';

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
  providers: [
    WebSocketService,
    UserService,
    ChatService
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  // Connection status
  isConnected: boolean = false;
  isLoading: boolean = false;

  // Subscriptions
  private messageSubscriptions: Map<string, Subscription> = new Map();
  private connectionSubscription?: Subscription;

  chatroomMessages: Map<string, any[]> = new Map();
  chats: Chat[] = [];
  activeChatroomId: string | null = null;

  user: any;
  selectedChat?: Chat;
  visible: boolean = false;
  newChatName: string = '';
  newRoom_type: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private webSocketService: WebSocketService,
  ) {}

  async ngOnInit(): Promise<void> {
    //localStorage.clear();
    if(!localStorage.getItem("access_token")) {
      this.router.navigate(['']);
    }
    console.log(localStorage.getItem("access_token"));
    
    //this.webSocketService.connect();
    //init credentials
    this.initCredentials();

    // Subscribe to connection status
    this.connectionSubscription = this.webSocketService
      .getConnectionStatus()
      .subscribe(status => {
        this.isConnected = status;
        console.log(status);

        // If reconnected, resubscribe to all chatrooms
        if (status && this.chats.length > 0) {
          this.getRooms();
        }
      });
      //this.chats = JSON.parse(localStorage.getItem('chats') ?? '[]');
      //console.log(this.chats);
      
      // Load chatrooms from API
      if(true) {
        await this.getRooms();
      }
  }

  // subscriptions
  subscribeToAllChatrooms(): void {
    this.chats.forEach(chatroom => {
      this.subscribeToChatroom(chatroom.id);
    });
  }

  subscribeToChatroom(chatroomId: string): void {
    // Check if already subscribed
    if (this.messageSubscriptions.has(chatroomId)) {
      return;
    }

    // Subscribe to chatroom messages
    const subscription = this.webSocketService
      .subscribeToChatroom(chatroomId)
      .subscribe(message => {
        if (message) {
          this.handleIncomingMessage(chatroomId, message);
        }
      });

    this.messageSubscriptions.set(chatroomId, subscription);
  }

  resubscribeToAllChatrooms(): void {
    // Clear existing subscriptions
    this.messageSubscriptions.forEach(sub => sub.unsubscribe());
    this.messageSubscriptions.clear();
    
    // Resubscribe to all chatrooms
    this.subscribeToAllChatrooms();
    
    // Rejoin active chatroom if username is set
    if (this.activeChatroomId && this.user.username) {
      this.webSocketService.joinChatroom(this.activeChatroomId, this.user.username);
    }
  }

  handleIncomingMessage(chatroomId: string, message: any): void {
    // Get or create message array for this chatroom
    let messages = this.chatroomMessages.get(chatroomId);
    if (!messages) {
      messages = [];
      this.chatroomMessages.set(chatroomId, messages);
    }
    
    // Add message
    messages.push(message);
    
    // Optional: Limit message history per chatroom
    if (messages.length > 100) {
      messages.shift();
    }
  }

  // rooms
  createRoom() {
    const room = {
      name: this.newChatName,
      type: this.newRoom_type,
      participants: [this.user.id]
    };
    this.chatService.create(room).subscribe({
      next: data => {
        console.warn(data);
        this.chats.push(data);
        console.warn(this.chats);
        localStorage.setItem('chats', JSON.stringify(this.chats));
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
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.warn(this.chats);
        localStorage.setItem('chats', JSON.stringify(this.chats));
        //this.subscribeToAllChatrooms();
      }
    });
  }

  // navigation
  navigateToChat(c :any) {
    this.router.navigate(['/chats', c.id]);
    this.selectedChat = c;
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

  initCredentials() {
    //localStorage.clear();
    let u = localStorage.getItem('user');
    this.user = JSON.parse(u ?? '{}');
    //console.warn(this.user);
    //console.warn(localStorage.getItem('access_token'));

    if(!this.user.id) {
      console.log("eeee");
      this.userService.getInfo().subscribe({
          next: data => {
            console.warn(data);
            localStorage.setItem('user', JSON.stringify(data));
          },
        complete: () => {
          this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
          console.log(this.user);
        }});
    }
  }
}
