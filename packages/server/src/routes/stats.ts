import type { Response } from "express";
import { Router } from "express";

interface QueryRecord {
  query: string;
  network: string;
  timestamp: string;
  txHash?: string;
}

interface Stats {
  totalQueries: number;
  queriesLast24h: number;
  recentQueries: QueryRecord[];
}

class StatsStore {
  private records: QueryRecord[] = [];
  private subscribers = new Set<Response>();

  record(entry: QueryRecord): void {
    this.records.push(entry);
    if (this.records.length > 500) {
      this.records = this.records.slice(-500);
    }
    this.broadcast(entry);
  }

  getStats(): Stats {
    const now = Date.now();
    const last24hBoundary = now - 24 * 60 * 60 * 1000;
    const queriesLast24h = this.records.filter((record) => {
      const time = Date.parse(record.timestamp);
      return Number.isFinite(time) && time >= last24hBoundary;
    }).length;

    return {
      totalQueries: this.records.length,
      queriesLast24h,
      recentQueries: this.records.slice(-50).reverse(),
    };
  }

  subscribe(res: Response): void {
    this.subscribers.add(res);
    res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);
  }

  unsubscribe(res: Response): void {
    this.subscribers.delete(res);
  }

  broadcast(entry: QueryRecord): void {
    const message = `data: ${JSON.stringify(entry)}\n\n`;
    for (const subscriber of this.subscribers) {
      subscriber.write(message);
    }
  }
}

export const statsStore = new StatsStore();

const router = Router();

router.get("/stats", (_req, res) => {
  res.json(statsStore.getStats());
});

router.get("/stats/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  statsStore.subscribe(res);
  req.on("close", () => {
    statsStore.unsubscribe(res);
    res.end();
  });
});

export { router as statsRouter };
