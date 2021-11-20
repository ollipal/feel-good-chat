import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import ChatMessageMenu from "./components/ChatMessageMenu";
import { predictSentiment, predictToxic } from "./messageProcessing";
import CheckIcon from '@mui/icons-material/Check';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from "@mui/material/IconButton";

firebase.initializeApp({
  apiKey: "AIzaSyBzYHyp_jBzGldqMBCessjUMlCLGf9x2EM",
  authDomain: "feelgoodchat-f4d99.firebaseapp.com",
  projectId: "feelgoodchat-f4d99",
  storageBucket: "feelgoodchat-f4d99.appspot.com",
  messagingSenderId: "486838102796",
  appId: "1:486838102796:web:216c87a43f669d1db5f729",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function PointView() {
  const userDocPath = `userInfo/${auth.currentUser.uid}`;
  const myRef = firestore.doc(userDocPath);
  const [me] = useDocumentData(myRef);
  return <h3>{me ? me.points : 0}</h3>;
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>FeelGoodChat</h1>
        {user ? <PointView /> : null}
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const userDocPath = `userInfo/${auth.currentUser.uid}`;
  const myRef = firestore.doc(userDocPath);
  const [me] = useDocumentData(myRef);

  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    setTimeout(() => dummy.current.scrollIntoView({ behavior: "smooth" }), 500);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const sentiment = await predictSentiment(formValue);
    let toxic = null;
    console.log("sentiment:", sentiment);
    let pointChange = 0;
    if (sentiment.negative > 0.4) {
      toxic = await predictToxic(formValue);
      console.log("toxic:", toxic);
      pointChange = -Object.values(toxic).reduce((a, c) => a + c) * 5;
    } else if (sentiment.positive > 0.3) {
      pointChange = sentiment.positive * 5;
    }
    console.log("pointChange:", pointChange);
    if (pointChange) {
      const currentPoints = me ? me.points : 0;
      await myRef.set({
        points: currentPoints + pointChange,
      });
    }

    const { uid, photoURL } = auth.currentUser;

    const newMessage = {
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      sentiment,
      pointChange,
      reportedBy: [],
      agreedBy: [],
      disagreedBy: [],
    };
    if (toxic) {
      newMessage.toxic = toxic;
    }
    await messagesRef.add(newMessage);

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, reportedBy, agreedBy, disagreedBy } = message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const report = () => {
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({ reportedBy: auth.currentUser.uid });
  };

  const handlePositive = () => {
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({ agreedBy: [...message.agreedBy, auth.currentUser.uid] });
  }

  const handleNegative = () => {
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({ disagreedBy: [...message.disagreedBy, auth.currentUser.uid] });
  }

  return (
    <>
      <div className={`message ${messageClass}`}>
        <ChatMessageMenu photoURL={photoURL} report={report} />
        <p>{text}</p>
        {reportedBy.length !== 0 && !(uid === auth.currentUser.uid) &&
          !(agreedBy.includes(auth.currentUser.uid) || disagreedBy.includes(auth.currentUser.uid)) &&
          <>
            <IconButton aria-label="positive" color="primary" onClick={handlePositive}>
              <CheckIcon/>
            </IconButton>
            <IconButton aria-label="negative" color="primary" onClick={handleNegative}>
              <HighlightOffIcon/>
            </IconButton>
          </>
        }
      </div>
    </>
  );
}

export default App;
