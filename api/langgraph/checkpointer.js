import { MemorySaver } from '@langchain/langgraph';
import fs from 'fs';
import path from 'path';

/**
 * DurableFileCheckpointer
 * Extends LangGraph MemorySaver to persist checkpoints, thread ownership,
 * and idempotency keys to a JSON file on disk.
 */
export class DurableFileCheckpointer extends MemorySaver {
  constructor(filePathOrOptions = '.agent_checkpoints.json') {
    super();
    const fp = typeof filePathOrOptions === 'string' ? filePathOrOptions : (filePathOrOptions?.filePath || '.agent_checkpoints.json');
    this.filePath = path.resolve(process.cwd(), fp);
    this.threadOwners = {}; // threadId -> userId
    this.idempotentRequests = {}; // requestId -> cachedResponse
    this._load();
  }

  _load() {
    if (!fs.existsSync(this.filePath)) return;
    try {
      const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (data.storage) {
        this.storage = {};
        for (const tid of Object.keys(data.storage)) {
          this.storage[tid] = {};
          for (const ns of Object.keys(data.storage[tid])) {
            this.storage[tid][ns] = {};
            for (const cid of Object.keys(data.storage[tid][ns])) {
              this.storage[tid][ns][cid] = data.storage[tid][ns][cid].map(item =>
                item ? Uint8Array.from(Object.values(item)) : null
              );
            }
          }
        }
      }
      if (data.threadOwners && typeof data.threadOwners === 'object') {
        this.threadOwners = data.threadOwners;
      }
      if (data.idempotentRequests && typeof data.idempotentRequests === 'object') {
        this.idempotentRequests = data.idempotentRequests;
      }
    } catch (err) {
      console.warn('[DurableFileCheckpointer] Failed to load checkpoints from disk:', err.message);
    }
  }

  _save() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.filePath, JSON.stringify({
          storage: this.storage,
          threadOwners: this.threadOwners,
          idempotentRequests: this.idempotentRequests
        }, null, 2), 'utf8');
      } catch (err) {
        console.warn('[DurableFileCheckpointer] Failed to save checkpoints to disk:', err.message);
      }
    }, 20);
  }

  flush() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify({
        storage: this.storage,
        threadOwners: this.threadOwners,
        idempotentRequests: this.idempotentRequests
      }, null, 2), 'utf8');
    } catch (err) {
      console.warn('[DurableFileCheckpointer] Failed to flush checkpoints to disk:', err.message);
    }
  }

  async put(config, checkpoint, metadata, newVersions) {
    const res = await super.put(config, checkpoint, metadata, newVersions);
    this._save();
    return res;
  }

  async putWrites(config, writes, taskId) {
    return await super.putWrites(config, writes, taskId);
  }

  registerThread(threadId, userId) {
    if (!threadId || !userId) return;
    if (this.threadOwners[threadId] && this.threadOwners[threadId] !== userId) {
      throw new Error(`Unauthorized: Thread "${threadId}" belongs to another user`);
    }
    this.threadOwners[threadId] = userId;
    this._save();
  }

  verifyThreadOwnership(threadId, userId) {
    if (!threadId || !userId) return true;
    if (this.threadOwners[threadId] && this.threadOwners[threadId] !== userId) {
      return false;
    }
    return true;
  }

  saveIdempotentResponse(requestId, response) {
    if (!requestId) return;
    this.idempotentRequests[requestId] = {
      response,
      timestamp: Date.now()
    };
    this._save();
  }

  getIdempotentResponse(requestId) {
    if (!requestId) return null;
    return this.idempotentRequests[requestId]?.response || null;
  }
}

// Global default singleton instance
export const defaultCheckpointer = new DurableFileCheckpointer();
