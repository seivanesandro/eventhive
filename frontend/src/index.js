import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

//  Importar estilos globais do Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Importar o componente principal da aplicação
import App from "./App";

//  Renderizar a aplicação React na root do HTML
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
