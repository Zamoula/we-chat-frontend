import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
  @ViewChildren('receivedMessage') receivedMessages!: QueryList<ElementRef>;

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
  private observer?: IntersectionObserver;

  constructor(
    private chatService: ChatService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService
  ) { }

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
    this.setupIntersectionObserver();

    // Subscribe to changes in the message list to observe new messages
    this.receivedMessages.changes.subscribe(() => {
      this.observeNewMessages();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions but keep WebSocket connection alive
    this.messageSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.observer?.disconnect();

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
    // 1. Check if this is a read receipt (often sent as { message: {...}, user: {...} })
    if (message.message && message.user && (message.message.id || message.message.content)) {
      const targetId = message.message.id;
      const reader = message.user;

      const index = this.messages.findIndex(m =>
        (targetId && m.id === targetId) ||
        (m.content === message.message.content &&
          Math.abs(new Date(m.timestamp).getTime() - new Date(message.message.timestamp).getTime()) < 1000)
      );

      if (index !== -1) {
        const msg = this.messages[index];
        if (!msg.statuses) msg.statuses = [];
        if (!msg.statuses.some((s: any) => (s.userId === reader.id || s.username === reader.username))) {
          msg.statuses.push({ status: 'READ', userId: reader.id, username: reader.username });
          this.messages[index] = { ...msg }; // Trigger change detection
          console.log('[ChatDetails] Updated statuses for message via read receipt:', msg.id);
        }
        return;
      }
    }

    // 2. Standard message handling logic
    const incomingSenderName = typeof message.sender === 'string' ? message.sender : message.sender?.username;

    // Check if message already exists (avoid duplicates)
    const index = this.messages.findIndex(m =>
      (m.id && message.id && m.id === message.id) ||
      (m.content === message.content &&
        (typeof m.sender === 'string' ? m.sender : m.sender?.username) === incomingSenderName &&
        Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp || new Date()).getTime()) < 1000)
    );

    if (index !== -1) {
      console.log('[ChatDetails] Message already exists, updating properties:', message.id);
      // Update existing message with new data (like statuses)
      this.messages[index] = { ...this.messages[index], ...message };
      return;
    }

    // Only add if it's a chat message or join event, not if it's some other internal event
    if (message.type === 'READ') {
      return; // Already handled above if it was correctly identified
    }

    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date();
    }

    this.messages.push(message);
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

    this.scrollToBottom();
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

  getMessageStatusIcon(m: any): string {
    if (this.isMessageRead(m)) {
      return 'pi pi-check-circle'; // Icon for Read
    }
    return 'pi pi-check'; // Icon for Sent/Unread
  }

  getMessageStatusColor(m: any): string {
    if (this.isMessageRead(m)) {
      return '#69f0ae'; // Light Green for read (visible on dark gradient)
    }
    return 'rgba(255, 255, 255, 0.7)'; // Semi-transparent white for sent
  }

  isMessageRead(m: any): boolean {
    // Check various common status properties for robustness
    if (m.status === 'READ' || m.read === true || m.isRead === true) {
      return true;
    }

    if (!m.statuses || !Array.isArray(m.statuses)) {
      return false;
    }
    return m.statuses.some((s: any) => s.status === 'READ');
  }

  private setupIntersectionObserver(): void {
    if (!this.scrollContainer) return;

    const options = {
      root: this.scrollContainer.nativeElement,
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of the message is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleMessageRead(entry.target);
        }
      });
    }, options);

    // Initial observation
    this.observeNewMessages();
  }

  private observeNewMessages(): void {
    if (!this.observer) return;

    this.receivedMessages?.forEach(msgRef => {
      const id = msgRef.nativeElement.getAttribute('data-id');
      const message = this.messages.find(m => m.id === id);

      // Observe only if we found the message and it's not read
      if (message && !this.isMessageRead(message)) {
        this.observer!.observe(msgRef.nativeElement);
      }
    });
  }

  private handleMessageRead(element: Element): void {
    const messageId = element.getAttribute('data-id');
    if (!messageId) return;
    const message = this.messages.find(m => m.id === messageId);

    if (message && !this.isMessageRead(message)) {
      console.log('[ChatDetails] Marking message as read:', messageId);

      const x = {
        message: message,
        user: this.user
      };

      // Send read receipt
      this.webSocketService.readMessage(this.chatroomId, x);

      // Optimistically update local status
      message.read = true;
      message.status = 'READ';
      message.isRead = true;

      // Update statuses array for isMessageRead() to work locally
      if (!message.statuses) {
        message.statuses = [];
      }
      if (!message.statuses.some((s: any) => s.userId === this.user.id)) {
        message.statuses.push({ status: 'READ', userId: this.user.id });
      }

      // Stop observing this element since it's now read
      this.observer?.unobserve(element);
    }
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const element = this.scrollContainer?.nativeElement;
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }, 100);
    } catch (err) {
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