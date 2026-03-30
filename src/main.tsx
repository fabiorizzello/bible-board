import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { appRouter } from "@/app/router";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>,
);
