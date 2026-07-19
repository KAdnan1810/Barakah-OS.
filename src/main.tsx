import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { useUIStore, applyTheme } from "@store/ui-store";
import "@styles/globals.css";

applyTheme(useUIStore.getState().theme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
