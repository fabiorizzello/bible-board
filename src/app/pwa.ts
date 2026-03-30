export type SyncStatus = "synced" | "syncing" | "offline" | "error";

export function getOnlineStatus(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function registerOnlineListener(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
