import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Admin auth: read PIN token from sessionStorage and inject as header
api.interceptors.request.use((cfg) => {
  const token = sessionStorage.getItem("rtc_admin_token");
  if (token && cfg.url && cfg.url.startsWith("/admin")) {
    cfg.headers = cfg.headers || {};
    cfg.headers["X-Admin-Pin"] = token;
  }
  return cfg;
});

export const WHATSAPP_NUMBER = "919999999999"; // placeholder
export const WHATSAPP_DISPLAY = "+91 99999 99999";
export const CALL_NUMBER = "+91 99999 99999";
export const EMAIL_ADDRESS = "hello@ranthamborescurator.com";
export const OFFICE_ADDRESS = "Sawai Madhopur, Rajasthan 322001";

export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
