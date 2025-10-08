import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getSyncStatus, offlineManager } from '@/utils/offline';
import { config } from '@/config/environment';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!config.features.offlineMode) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update sync status periodically
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    try {
      await offlineManager.forcSync();
      setSyncStatus(getSyncStatus());
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  if (!config.features.offlineMode) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Card 
        className={`transition-all duration-300 cursor-pointer ${
          isOnline 
            ? 'bg-background/80 backdrop-blur border-border/40' 
            : 'bg-warning/10 border-warning/30'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-warning" />
            )}
            
            <div className="text-sm">
              <div className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              {syncStatus.pendingChanges > 0 && (
                <div className="text-xs text-muted-foreground">
                  {syncStatus.pendingChanges} pending changes
                </div>
              )}
            </div>

            {syncStatus.syncInProgress && (
              <RefreshCw className="h-3 w-3 animate-spin text-primary" />
            )}
          </div>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isOnline ? 'text-success' : 'text-warning'}>
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span>{syncStatus.pendingChanges} changes</span>
                </div>
                
                {syncStatus.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last sync:</span>
                    <span>{syncStatus.lastSync.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {isOnline && syncStatus.pendingChanges > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSync();
                  }}
                  disabled={syncStatus.syncInProgress}
                  className="w-full h-7 text-xs"
                >
                  {syncStatus.syncInProgress ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}

              {!isOnline && (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  <span>Working offline</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncStatus,
    hasOfflineCapability: config.features.offlineMode,
  };
}