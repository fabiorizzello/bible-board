import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { JazzProvider } from "jazz-react";
import { AuthProvider } from "@/app/auth-context";
import { TimelineBoardAccount } from "@/features/workspace/workspace.schema";
import { appRouter } from "@/app/router";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <JazzProvider
      AccountSchema={TimelineBoardAccount}
      sync={{ when: "never" }}
    >
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </JazzProvider>
  </React.StrictMode>,
);
