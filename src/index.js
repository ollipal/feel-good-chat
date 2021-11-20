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
    </div>

    <div className="instruction-wrapper">
      <div>{`👋 Hello and welcome to FeelGoodChat, a place for having nice conversations.

By being positive and nice to others, you gain positivity score that will unlock in-game items (game TBA).

Negative behaviour is moderated by our AI, and you can help it to improve by reporting bad behaviour, and voting other reports.

You can also highlight nice or helpful messages by clicking them, which improves the user's score.
      `}</div>
    </div>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
