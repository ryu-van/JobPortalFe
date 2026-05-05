import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let reconnectAttempt = 0;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

export function connect(onMessage) {
  if (stompClient?.active) return;

  const client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: () => {
      const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttempt), MAX_DELAY);
      reconnectAttempt += 1;
      return delay;
    },
    onConnect: () => {
      reconnectAttempt = 0;
      if (!stompClient?.active) return;
      stompClient.subscribe('/user/queue/notifications', (frame) => {
        try {
          const notification = JSON.parse(frame.body);
          onMessage(notification);
        } catch (e) {
          console.error('Failed to parse notification frame:', e);
        }
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
    onDisconnect: () => {
      reconnectAttempt = 0;
    },
  });

  stompClient = client;
  stompClient.activate();
}

export function disconnect() {
  if (stompClient) {
    const client = stompClient;
    stompClient = null; 
    reconnectAttempt = 0;
    client.deactivate();
  }
}
