import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chat.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { Toast, ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-details',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ClipboardModule,
    ToastModule,
    Toast
  ],
  // REMOVED WebSocketService from providers - it's already a singleton
  providers: [MessageService, ChatService],
  templateUrl: './chat-details.component.html',
  styleUrl: './chat-details.component.scss'
})
export class ChatDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  chat!: Chat;
  chatroomId: string = '';
  message: string = '';
  messages: any[] = [];
  visible: boolean = false;
  isMember: boolean = false;
  link: string = 'http://localhost:4200/chats/';
  isLoading: boolean = false;
  isConnected: boolean = false;
  
  user: any;
  private messageSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Get user from localStorage
    this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
    
    // Get chatroom ID from route
    this.chatroomId = this.route.snapshot.paramMap.get('id') || '';

    console.log('[ChatDetails] Component initialized for chatroom:', this.chatroomId);
    console.log('[ChatDetails] Is subscribed to chatroom:', this.webSocketService.isSubscribedToChatroom(this.chatroomId));
    console.log('[ChatDetails] WebSocket connected:', this.webSocketService.isConnected());

    // Subscribe to connection status changes
    this.connectionSubscription = this.webSocketService
      .getConnectionStatus()
      .subscribe(status => {
        console.log('[ChatDetails] WebSocket connection status changed:', status);
        this.isConnected = status;
        
        if (status && !this.messageSubscription) {
          console.log('[ChatDetails] Connection established, subscribing to messages...');
          this.subscribeToMessages();
        }
      });

    // Fetch room details
    this.fetchRoom();
    
    // Load messages from API
    this.loadMessages();
    
    // Subscribe to WebSocket messages if already connected
    if (this.webSocketService.isConnected()) {
      console.log('[ChatDetails] WebSocket already connected, setting up subscription...');
      this.isConnected = true;
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        this.subscribeToMessages();
      }, 100);
    } else {
      console.warn('[ChatDetails] WebSocket not connected yet, waiting for connection...');
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions but keep WebSocket connection alive
    this.messageSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    
    // Don't unsubscribe from chatroom or disconnect - other components need it
  }

  // Load messages from API
  loadMessages(): void {
    this.isLoading = true;
    
    this.chatService.getMessages(this.chatroomId).subscribe({
      next: (data: any) => {
        console.log('Loaded messages from API:', data);
        this.messages = data || [];
        
        // Sort messages by timestamp (oldest first)
        this.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      },
      error: (err: any) => {
        console.error('Error loading messages:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load messages' 
        });
      },
      complete: () => {
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  // Subscribe to WebSocket messages
  subscribeToMessages(): void {
    if (this.messageSubscription) {
      console.log('[ChatDetails] Already subscribed to messages');
      return;
    }

    if (!this.webSocketService.isConnected()) {
      console.warn('[ChatDetails] WebSocket not connected, cannot subscribe');
      return;
    }

    // Check if already subscribed from home component
    if (this.webSocketService.isSubscribedToChatroom(this.chatroomId)) {
      console.log('[ChatDetails] Already subscribed to this chatroom from another component, reusing subscription');
    } else {
      console.log('[ChatDetails] Creating new subscription for chatroom:', this.chatroomId);
    }
    
    this.messageSubscription = this.webSocketService
      .subscribeToChatroom(this.chatroomId)
      .subscribe({
        next: (message) => {
          if (message) {
            console.log('[ChatDetails] Received WebSocket message:', message);
            this.handleIncomingMessage(message);
          }
        },
        error: (error) => {
          console.error('[ChatDetails] Error in message subscription:', error);
        }
      });

    // Join the chatroom (send JOIN message to server)
    if (this.user?.username) {
      console.log('[ChatDetails] Sending JOIN message for user:', this.user.username);
      this.webSocketService.joinChatroom(this.chatroomId, this.user.username);
    }
  }

  // Handle incoming WebSocket message
  handleIncomingMessage(message: any): void {
    // Check if message already exists (avoid duplicates)
    const exists = this.messages.some(m => 
      m.id === message.id || 
      (m.content === message.content && 
       m.sender === message.sender && 
       Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp || new Date()).getTime()) < 1000)
    );

    if (!exists) {
      // Add timestamp if not present
      if (!message.timestamp) {
        message.timestamp = new Date();
      }

      this.messages.push(message);
      this.scrollToBottom();

      // Show notification for messages from others
      if (message.type === 'CHAT' && message.sender !== this.user?.username) {
        this.messageService.add({ 
          severity: 'info', 
          summary: message.sender, 
          detail: message.content,
          life: 3000
        });
      }
    }
  }

  // Send message via WebSocket
  sendMessage(): void {
    if (!this.message.trim()) {
      return;
    }

    if (!this.isConnected) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Not Connected', 
        detail: 'Please wait for connection...' 
      });
      return;
    }

    if (!this.user?.username) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'User not found' 
      });
      return;
    }

    // Create message object
    const messageObj = {
      senderId: this.user.id,
      content: this.message.trim(),
      messageType: "TEXT"
    };

    // Send via WebSocket
    this.webSocketService.sendMessage(this.chatroomId, messageObj);

    // Clear input
    this.message = '';
  }

  // Participate in chat
  participate(): void {
    const u_obj = {
      id: this.user.id,
      username: this.user.username,
      email: this.user.email,
      phone: this.user.phone
    };

    this.chatService.participate(this.chatroomId, u_obj).subscribe({
      next: (data) => {
        this.chat = data;
      },
      error: (err) => {
        console.error('Error joining chat:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to join chat' 
        });
      },
      complete: () => {
        this.isMember = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Welcome!', 
          detail: `You have joined ${this.chat.name}` 
        });
        
        // Subscribe to messages after joining
        if (this.isConnected) {
          this.subscribeToMessages();
        }
      }
    });
  }

  // Fetch room details
  fetchRoom(): void {
    this.chatService.getRoom(this.chatroomId).subscribe({
      next: (data) => {
        console.log('Room details:', data);
        this.chat = data;
      },
      error: (err) => {
        console.error('Error fetching room:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load chat details' 
        });
      },
      complete: () => {
        this.link = `http://localhost:4200/chats/${this.chat.id}`;
        
        // Check if user is participant
        if (!this.chat.participants?.some(u => u.email === this.user.email)) {
          this.isMember = true;
        }
      }
    });
  }

  // Helper methods
  getAvatarUrl(name: any): string {
    if (name == null) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.chat?.name || 'Chat')}&background=random&color=fff`;
    }
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
      return time;
    }

    const day = date.toLocaleDateString([], {
      weekday: 'short'
    });

    return `${day} ${time}`;
  }

  verifSender(sender: any): boolean {
    // Handle both string and object sender formats
    const senderName = typeof sender === 'string' ? sender : sender?.username;
    return senderName === this.user?.username;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const element = this.scrollContainer?.nativeElement;
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }, 100);
    } catch(err) { 
      console.error('Error scrolling to bottom:', err);
    }
  }

  copyText(): void {
    this.clipboard.copy(this.link);
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Info', 
      detail: 'Link copied to clipboard!' 
    });
  }

  // Keyboard shortcut for sending message
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}