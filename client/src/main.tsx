
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import AppProviders from "./app/providers";
import "./index.css";

const googleClientId = import.meta.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error(
    "Google Client ID is missing. Check your VITE_GOOGLE_CLIENT_ID environment variable."
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <AppProviders>
      <App />
    </AppProviders>
  </GoogleOAuthProvider>
);
