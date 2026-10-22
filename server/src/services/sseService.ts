import { Response } from 'express';

interface Client {
  id: string;
  res: Response;
}

class SseService {
  private clients: Client[] = [];

  addClient(id: string, res: Response): void {
    this.clients.push({ id, res });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial connected ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    res.on('close', () => {
      this.clients = this.clients.filter((c) => c.id !== id);
    });
  }

  broadcast(eventType: string, payload: any): void {
    const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (e) {
        // Handle disconnected client
      }
    }
  }
}

export const sseService = new SseService();
