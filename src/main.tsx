import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "./i18n";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider
  reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  scriptProps={{
    async: true,
    defer: true,
    appendTo: "head",
  }}
>
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleReCaptchaProvider>
);
