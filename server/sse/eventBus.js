class SSEEventBus {
  constructor() {
    this.clients = new Map(); // userId string -> Set of res objects
  }

  addClient(userId, res) {
    const uKey = userId.toString();
    if (!this.clients.has(uKey)) {
      this.clients.set(uKey, new Set());
    }
    this.clients.get(uKey).add(res);

    reqResCleanup(res, () => {
      if (this.clients.has(uKey)) {
        this.clients.get(uKey).delete(res);
        if (this.clients.get(uKey).size === 0) {
          this.clients.delete(uKey);
        }
      }
    });
  }

  emitToUser(userId, eventType, payload) {
    const uKey = userId ? userId.toString() : null;
    if (uKey && this.clients.has(uKey)) {
      const clientSet = this.clients.get(uKey);
      const dataStr = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
      clientSet.forEach(res => {
        try {
          res.write(dataStr);
        } catch (e) {
          // ignore closed connection
        }
      });
    }
  }

  broadcast(eventType, payload) {
    const dataStr = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    this.clients.forEach(clientSet => {
      clientSet.forEach(res => {
        try {
          res.write(dataStr);
        } catch (e) {
          // ignore
        }
      });
    });
  }
}

function reqResCleanup(res, callback) {
  res.on('close', callback);
  res.on('finish', callback);
  res.on('error', callback);
}

export const eventBus = new SSEEventBus();
