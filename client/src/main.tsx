import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * GitHub Pages SPA fallback: when the user opens an inner route (e.g. /calculators)
 * GitHub serves 404.html, which saves the original path into sessionStorage and
 * redirects to the app root. We restore that path here so the router shows the
 * correct page instead of the home page.
 */
if (import.meta.env.PROD) {
  try {
    const restorePath = sessionStorage.getItem("spa_restore_path");
    if (restorePath) {
      sessionStorage.removeItem("spa_restore_path");
      const search = sessionStorage.getItem("spa_restore_search") || "";
      sessionStorage.removeItem("spa_restore_search");
      const target = import.meta.env.BASE_URL.replace(/\/$/, "") + restorePath + search;
      window.history.replaceState(null, "", target);
    }
  } catch (e) { /* ignore storage errors */ }
}

createRoot(document.getElementById("root")!).render(<App />);
