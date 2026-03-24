import { useEffect } from "react";
import { RouterProvider } from "react-router/dom";
import { appRouter } from "@/app/router";

export function App({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return <RouterProvider router={appRouter} />;
}
