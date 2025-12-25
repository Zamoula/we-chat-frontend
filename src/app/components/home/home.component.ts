import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { buildRoomPreviews, formatTimestamp, getRandomHexColor, setAvatar } from '../../utils/chat.utils';

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
  // REMOVED WebSocketService from providers - it's already a singleton
  providers: [
    UserService,
    ChatService
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  // Connection status
  isConnected: boolean = false;
  isLoading: boolean = false;

  // Subscriptions
  private messageSubscriptions: Map<string, Subscription> = new Map();
  private connectionSubscription?: Subscription;

  chatroomMessages: Map<string, any[]> = new Map();
  chats: Chat[] = [];
  previewChats: any[] = [];
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
    console.warn(localStorage.getItem('access_token'));
    
    // Check authentication
    if(!localStorage.getItem("access_token")) {
      this.router.navigate(['']);
      return;
    }

    // Initialize user credentials first
    await this.initCredentials();

    // Subscribe to connection status
    this.connectionSubscription = this.webSocketService
      .getConnectionStatus()
      .subscribe(status => {
        console.log('Connection status changed:', status);
        this.isConnected = status;

        // If reconnected, resubscribe to all chatrooms
        if (status && this.chats.length > 0) {
          this.resubscribeToAllChatrooms();
        }
      });

    // Check if already connected (from app initializer)
    if (this.webSocketService.isConnected()) {
      console.log('WebSocket already connected');
      this.isConnected = true;
    }

    // Load rooms
    await this.getRooms();

    this.initPreviewChats();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.messageSubscriptions.forEach(sub => sub.unsubscribe());
    this.messageSubscriptions.clear();
    this.connectionSubscription?.unsubscribe();
    
    // Don't disconnect WebSocket - other components might need it
  }

  // Helper method to add delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Subscriptions
  subscribeToAllChatrooms(): void {
    if (!this.webSocketService.isConnected()) {
      console.error('Cannot subscribe - WebSocket not connected');
      return;
    }

    console.log(`Subscribing to ${this.chats.length} chatrooms...`);
    this.chats.forEach(chatroom => {
      this.subscribeToChatroom(chatroom.id);
    });
  }

  subscribeToChatroom(chatroomId: string): void {
    // Check if already subscribed
    if (this.messageSubscriptions.has(chatroomId)) {
      console.log('Already subscribed to:', chatroomId);
      return;
    }

    if (!this.webSocketService.isConnected()) {
      console.error('Cannot subscribe to', chatroomId, '- not connected');
      return;
    }

    console.log('Subscribing to chatroom:', chatroomId);

    // Subscribe to chatroom messages
    const subscription = this.webSocketService
      .subscribeToChatroom(chatroomId)
      .subscribe({
        next: (message) => {
          if (message) {
            console.log('Received message in room', chatroomId, ':', message);
            this.handleIncomingMessage(chatroomId, message);
          }
        },
        error: (error) => {
          console.error('Error in subscription for', chatroomId, ':', error);
        }
      });

    this.messageSubscriptions.set(chatroomId, subscription);
  }

  resubscribeToAllChatrooms(): void {
    console.log('Resubscribing to all chatrooms...');
    
    // Clear existing subscriptions
    this.messageSubscriptions.forEach(sub => sub.unsubscribe());
    this.messageSubscriptions.clear();
    
    // Resubscribe to all chatrooms
    this.subscribeToAllChatrooms();
    
    // Rejoin active chatroom if username is set
    if (this.activeChatroomId && this.user?.username) {
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

  // Rooms
  createRoom() {
    const room = {
      name: this.newChatName,
      type: this.newRoom_type,
      participants: [this.user.id]
    };
    
    this.chatService.create(room).subscribe({
      next: data => {
        console.log('Room created:', data);
        this.chats.push(data);
        localStorage.setItem('chats', JSON.stringify(this.chats));
        
        // Subscribe to the new room if connected
        if (this.webSocketService.isConnected()) {
          this.subscribeToChatroom(data.id);
        }
      },
      error: (err) => {
        console.error('Error creating room:', err);
      }
    });

    // Reset values
    this.newChatName = '';
    this.newRoom_type = 'PUBLIC';
    this.visible = false;
  }

  async getRooms(): Promise<void> {
    this.isLoading = true;
    
    return new Promise((resolve, reject) => {
      this.chatService.getChatRooms(this.user.id).subscribe({
        next: (data) => {
          this.chats = data;
          console.log('Loaded chats:', this.chats);
        },
        error: (err) => {
          console.error('Error loading rooms:', err);
          this.isLoading = false;
          reject(err);
        },
        complete: () => {
          localStorage.setItem('chats', JSON.stringify(this.chats));
          
          // Subscribe to all chatrooms if connected
          if (this.webSocketService.isConnected()) {
            this.subscribeToAllChatrooms();
          } else {
            console.warn('Not connected yet, will subscribe when connected');
          }
          
          this.isLoading = false;
          resolve();
        }
      });
    });
  }

  initPreviewChats() {
    this.previewChats = buildRoomPreviews(this.chats, this.user.id);
    console.warn(this.previewChats);
    this.previewChats.forEach(c => {
      c.avatar = setAvatar(c.name);
      c.color = getRandomHexColor();
      
      if(c.unreadCount > 1) {
        c.hasUnread = true;
      }

      c.timestamp = formatTimestamp(c.timestamp);
    });
  }

  // Navigation
  navigateToChat(c: any) {
    console.log('[Home] Navigating to chat:', c.id);
    console.log('[Home] WebSocket connected:', this.webSocketService.isConnected());
    console.log('[Home] Is subscribed to chatroom:', this.webSocketService.isSubscribedToChatroom(c.id));
    
    this.router.navigate(['/chats', c.id]);
    this.selectedChat = c;
    this.activeChatroomId = c.id;
    localStorage.setItem("selectedChat", JSON.stringify(c));
    
    // Join the chatroom (send JOIN message)
    if (this.webSocketService.isConnected() && this.user?.username) {
      console.log('[Home] Sending JOIN message for chatroom:', c.id);
      this.webSocketService.joinChatroom(c.id, this.user.username);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  // Helper methods
  showDialog() {
    this.visible = true;
  }

  async initCredentials(): Promise<void> {
    return new Promise((resolve) => {
      let u = localStorage.getItem('user');
      this.user = JSON.parse(u ?? '{}');

      if(!this.user?.id) {
        console.log('Fetching user info...');
        this.userService.getInfo().subscribe({
          next: data => {
            console.log('User info loaded:', data);
            localStorage.setItem('user', JSON.stringify(data));
            this.user = data;
          },
          error: (err) => {
            console.error('Error fetching user info:', err);
            resolve();
          },
          complete: () => {
            resolve();
          }
        });
      } else {
        console.log('User already loaded from localStorage:', this.user);
        resolve();
      }
    });
  }
}