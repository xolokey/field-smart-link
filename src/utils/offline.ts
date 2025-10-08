// Offline functionality and service worker management
import { config } from '@/config/environment';

export interface OfflineData {
  farms: any[];
  crops: any[];
  messages: any[];
  lastSync: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
}

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private pendingChanges: any[] = [];
  private syncInProgress: boolean = false;
  private lastSync: Date | null = null;
  private dbName = 'field-smart-link-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (typeof window !== 'undefined' && config.features.offlineMode) {
      this.initializeOfflineSupport();
    }
  }

  private async initializeOfflineSupport() {
    // Initialize IndexedDB
    await this.initDB();
    
    // Set up network event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Load pending changes from storage
    await this.loadPendingChanges();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('farms')) {
          db.createObjectStore('farms', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('crops')) {
          db.createObjectStore('crops', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('pendingChanges')) {
          db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private handleOnline() {
    this.isOnline = true;
    console.log('Connection restored - syncing data...');
    this.syncPendingChanges();
  }

  private handleOffline() {
    this.isOnline = false;
    console.log('Connection lost - switching to offline mode');
  }

  // Store data for offline access
  async storeOfflineData(storeName: string, data: any[]): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data
    await store.clear();
    
    // Store new data
    for (const item of data) {
      await store.add(item);
    }
  }

  // Retrieve offline data
  async getOfflineData(storeName: string): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Queue changes for sync when online
  async queueChange(change: {
    type: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    timestamp: number;
  }): Promise<void> {
    this.pendingChanges.push(change);
    
    if (this.db) {
      const transaction = this.db.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      await store.add(change);
    }
  }

  // Load pending changes from storage
  private async loadPendingChanges(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['pendingChanges'], 'readonly');
    const store = transaction.objectStore('pendingChanges');
    
    const request = store.getAll();
    request.onsuccess = () => {
      this.pendingChanges = request.result;
    };
  }

  // Sync pending changes when online
  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.pendingChanges.length === 0) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      // In a real implementation, you would sync with your backend
      // For now, we'll just simulate the sync
      console.log(`Syncing ${this.pendingChanges.length} pending changes...`);
      
      // Simulate API calls
      for (const change of this.pendingChanges) {
        await this.syncSingleChange(change);
      }
      
      // Clear pending changes
      this.pendingChanges = [];
      if (this.db) {
        const transaction = this.db.transaction(['pendingChanges'], 'readwrite');
        const store = transaction.objectStore('pendingChanges');
        await store.clear();
      }
      
      this.lastSync = new Date();
      console.log('Sync completed successfully');
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSingleChange(change: any): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would make actual API calls here
    console.log('Syncing change:', change.type, change.table);
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingChanges: this.pendingChanges.length,
      syncInProgress: this.syncInProgress,
    };
  }

  // Check if app can work offline
  isOfflineCapable(): boolean {
    return !!(
      'serviceWorker' in navigator &&
      'indexedDB' in window &&
      config.features.offlineMode
    );
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingChanges();
    }
  }

  // Clear offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const storeNames = ['farms', 'crops', 'messages', 'pendingChanges'];
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
    this.pendingChanges = [];
    this.lastSync = null;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

// Convenience functions
export const storeForOffline = (storeName: string, data: any[]) => {
  return offlineManager.storeOfflineData(storeName, data);
};

export const getOfflineData = (storeName: string) => {
  return offlineManager.getOfflineData(storeName);
};

export const queueOfflineChange = (change: any) => {
  return offlineManager.queueChange(change);
};

export const getSyncStatus = () => {
  return offlineManager.getSyncStatus();
};

export const isOfflineCapable = () => {
  return offlineManager.isOfflineCapable();
};