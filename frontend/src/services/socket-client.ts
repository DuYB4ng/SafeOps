type EventCallback = (data: unknown) => void;

class SocketClient {
  private url: string;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected: boolean = false;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001') {
    this.url = url;
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    // Prepare for Socket.IO library integration in M2
    this.isConnected = true;
    this.emitLocal('connection', { connected: true, url: this.url });
  }

  public disconnect(): void {
    this.isConnected = false;
    this.emitLocal('disconnect', { connected: false });
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit(event: string, data: unknown): void {
    if (!this.isConnected) {
      return;
    }
    this.emitLocal(event, data);
  }

  private emitLocal(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const socketClient = new SocketClient();
