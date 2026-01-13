import SockJS from 'sockjs-client';
import Stomp, { Client, Subscription } from 'stompjs';

export interface MessageUpdate {
    conversationId: string;
    [key: string]: any;
}

export type MessageCallback = (message: any) => void;
export type TypingCallback = (data: { userId: string; isTyping: boolean }) => void;

class ChatWebSocketClient {
    private client: Client | null = null;
    private subscriptions: Map<string, Subscription> = new Map();
    private connected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    async connect(token: string): Promise<void> {
        if (this.connected && this.client) return;
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            const socketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws-chat`;
            const socket = new SockJS(socketUrl);
            this.client = Stomp.over(socket);

            if (import.meta.env.PROD) {
                this.client.debug = () => { };
            }

            const headers = {
                Authorization: `Bearer ${token}`
            };

            this.client.connect(
                headers,
                (frame) => {
                    this.connected = true;
                    this.connectionPromise = null;
                    console.log('Connected to WebSocket:', frame);
                    resolve();
                },
                (error) => {
                    this.connected = false;
                    this.connectionPromise = null;
                    console.error('WebSocket connection error:', error);
                    reject(error);
                }
            );
        });

        return this.connectionPromise;
    }

    subscribeToConversation(conversationId: string, callback: MessageCallback) {
        if (!this.client || !this.connected) {
            console.error('Cannot subscribe: not connected');
            return;
        }

        const topic = `/topic/conversation/${conversationId}`;
        if (this.subscriptions.has(topic)) return;

        const subscription = this.client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, subscription);
    }

    subscribeToNotifications(callback: (notification: any) => void) {
        if (!this.client || !this.connected) return;

        const topic = '/user/queue/notifications';
        if (this.subscriptions.has(topic)) return;

        const subscription = this.client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, subscription);
    }

    subscribeToTyping(conversationId: string, callback: TypingCallback) {
        if (!this.client || !this.connected) return;

        const topic = `/topic/conversation/${conversationId}/typing`;
        if (this.subscriptions.has(topic)) return;

        const subscription = this.client.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, subscription);
    }

    unsubscribe(conversationId: string) {
        const topics = [
            `/topic/conversation/${conversationId}`,
            `/topic/conversation/${conversationId}/typing`
        ];

        topics.forEach(topic => {
            const sub = this.subscriptions.get(topic);
            if (sub) {
                sub.unsubscribe();
                this.subscriptions.delete(topic);
            }
        });
    }

    sendMessage(conversationId: string, text: string) {
        if (!this.client || !this.connected) return;

        this.client.send('/app/chat.send', {}, JSON.stringify({
            conversationId: conversationId,
            contentType: 'TEXT',
            contentText: text
        }));
    }

    sendTyping(conversationId: string, isTyping: boolean) {
        if (!this.client || !this.connected) return;

        this.client.send('/app/chat.typing', {}, JSON.stringify({
            conversationId: conversationId,
            isTyping: isTyping
        }));
    }

    disconnect() {
        if (this.client) {
            this.client.disconnect(() => {
                this.connected = false;
                this.subscriptions.clear();
                console.log('Disconnected from WebSocket');
            });
        }
    }

    isConnected() {
        return this.connected;
    }
}

export const chatWebSocketClient = new ChatWebSocketClient();
