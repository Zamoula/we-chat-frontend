import { Injectable } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  // Store messages by chatroom ID
  private messageSubjects: Map<string, Subject<any>> = new Map();
  
  // Store active subscriptions
  private subscriptions: Map<string, StompSubscription> = new Map();

  constructor() {}

  connect(serverUrl: string = 'http://localhost:3000/ws-chat'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient?.connected) {
        resolve();
        return;
      }

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(serverUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        onConnect: () => {
          console.log('Connected to WebSocket');
          this.connectionStatus.next(true);
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          this.connectionStatus.next(false);
          reject(frame);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus.next(false);
          reject(error);
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
          this.connectionStatus.next(false);
        }
      });

      this.stompClient.activate();
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      // Unsubscribe from all chatrooms
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      
      // Clear message subjects
      this.messageSubjects.forEach(subject => subject.complete());
      this.messageSubjects.clear();
      
      this.stompClient.deactivate();
      this.connectionStatus.next(false);
      console.log('Disconnected from WebSocket');
    }
  }

  subscribeToChatroom(chatroomId: string): Observable<any> {
    // Return existing subject if already subscribed
    if (this.messageSubjects.has(chatroomId)) {
      console.warn("already subscribed to room with id : ", chatroomId);
      
      return this.messageSubjects.get(chatroomId)!.asObservable();
    }

    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot subscribe - not connected');
      const subject = new Subject<any>();
      this.messageSubjects.set(chatroomId, subject);
      return subject.asObservable();
    }

    // Create new subject for this chatroom
    const subject = new Subject<any>();
    this.messageSubjects.set(chatroomId, subject);

    const destination = `/topic/chatroom/${chatroomId}`;
    
    const subscription = this.stompClient.subscribe(
      destination,
      (message: Message) => {
        const chatMessage: any = JSON.parse(message.body);
        subject.next(chatMessage);
      }
    );

    this.subscriptions.set(chatroomId, subscription);
    console.log('Subscribed to chatroom:', chatroomId);

    return subject.asObservable();
  }

  unsubscribeFromChatroom(chatroomId: string): void {
    const subscription = this.subscriptions.get(chatroomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(chatroomId);
      console.log('Unsubscribed from chatroom:', chatroomId);
    }

    const subject = this.messageSubjects.get(chatroomId);
    if (subject) {
      subject.complete();
      this.messageSubjects.delete(chatroomId);
    }
  }

  joinChatroom(chatroomId: string, username: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot join - not connected');
      return;
    }

    const message: any = {
      sender: username,
      content: `${username} joined the chatroom`,
      type: 'JOIN'
    };

    this.stompClient.publish({
      destination: `/app/chat/${chatroomId}/join`,
      body: JSON.stringify(message)
    });
  }

  sendMessage(chatroomId: string, message: any): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot send message - not connected');
      return;
    }

    this.stompClient.publish({
      destination: `/app/chat/${chatroomId}/sendMessage`,
      body: JSON.stringify(message)
    });
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  isSubscribedToChatroom(chatroomId: string): boolean {
    return this.subscriptions.has(chatroomId);
  }
}
