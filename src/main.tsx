import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);