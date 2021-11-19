import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <div className="qr-wrapper">
      <p>Join:</p>
      <img className="qr" src="/qr.png" alt="qr-code-join" />
      {/* <a href="https://feel-good-chat.pages.dev">feel-good-chat.pages.dev</a> */}
    </div>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
