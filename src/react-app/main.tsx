import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { setupGlobalErrorHandlers } from "./utils/errorHandler";

// Setup global error handlers
setupGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
