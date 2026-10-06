import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans-condensed/700.css";
import App from "./App";
import { createLocalServices } from "./services/localServices";
import "./style.css";

// Raiz de composição: aqui se escolhe a implementação dos serviços.
const services = createLocalServices();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App services={services} />
  </React.StrictMode>,
);