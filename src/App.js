import React, { useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
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
import InfoSnackBar from "./components/InfoSnackBar";
import { predictSentiment, predictToxic } from "./messageProcessing";
import CheckIcon from "@mui/icons-material/Check";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const logOut = () => {
    handleClose();
    auth.signOut();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <h3>
        {auth.currentUser.displayName}, score: {me ? me.points.toFixed(2) : 0}
      </h3>
      <div>
        <MoreVertIcon onClick={handleClick} />
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          autoFocus={false}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={logOut}>
            <Typography sx={{ color: "black" }}>Log out</Typography>
          </MenuItem>
        </Menu>
      </div>
    </>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="main-header">
        <h1>FeelGoodChat</h1>
        {user ? <PointView /> : null}
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

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const userDocPath = `userInfo/${auth.currentUser.uid}`;
  const myRef = firestore.doc(userDocPath);
  const [me] = useDocumentData(myRef);

  const [formValue, setFormValue] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setTimeout(() => dummy.current.scrollIntoView({ behavior: "smooth" }), 500);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    setSending(true);
    const sentiment = await predictSentiment(formValue);
    let toxic = null;
    console.log("sentiment:", sentiment);
    let pointChange = 0;
    if (sentiment.negative > 0.4) {
      toxic = await predictToxic(formValue);
      console.log("toxic:", toxic);
      const total = Object.values(toxic).reduce((a, c) => a + c);
      if (total > 0.1) {
        pointChange = -total * 5;
      }
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
    setSending(false);
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
          {sending ? <CircularProgress style={{ color: "white" }} /> : "Send"}
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, reportedBy, agreedBy, disagreedBy } = message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const [openSB, setOpenSB] = React.useState(false);

  const report = () => {
    console.log(message);
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({ reportedBy: auth.currentUser.uid });
  };

  const handlePositive = () => {
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({
      agreedBy: [...message.agreedBy, auth.currentUser.uid],
    });
    setOpenSB(true);
  };

  const handleNegative = () => {
    const messageRef = firestore.doc(`messages/${message.id}`);
    messageRef.update({
      disagreedBy: [...message.disagreedBy, auth.currentUser.uid],
    });
    setOpenSB(true);
  };

  let badMessageReminder = null;
  if (message.pointChange < 0 && message.toxic) {
    badMessageReminder = "This message was not ok!";

    const badCategories = [];
    for (const [key, value] of Object.entries(message.toxic)) {
      if (value > 0.3) {
        badCategories.push(key);
      }
    }
    if (badCategories.length) {
      badMessageReminder += ` It seems to be ${badCategories.join(", ")}.`;
    }
    badMessageReminder +=
      " Remember you lose points if you send bad messages :)";
  }

  return (
    <>
      <div className={`message ${messageClass}`}>
        <ChatMessageMenu photoURL={photoURL} report={report} />
        <p>{text}</p>
        {reportedBy.length !== 0 && !(reportedBy.includes(auth.currentUser.uid)) &&
          !(uid === auth.currentUser.uid) &&
          !(
            agreedBy.includes(auth.currentUser.uid) ||
            disagreedBy.includes(auth.currentUser.uid)
          ) && (
            <>
              <div style={{padding: "3px", color: "#1976d2"}}>Reported. Verify?</div>
              <IconButton
                aria-label="positive"
                color="primary"
                onClick={handlePositive}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                aria-label="negative"
                color="primary"
                onClick={handleNegative}
              >
                <HighlightOffIcon />
              </IconButton>
            </>
          )}
      </div>
      {badMessageReminder ? (
        <div className={`message ${messageClass}`}>
          <ChatMessageMenu photoURL={"/robot.png"} report={report} />
          {badMessageReminder ? (
            <p className="robot">{badMessageReminder}</p>
          ) : null}
        </div>
      ) : null}
      <InfoSnackBar openSB={openSB} setOpenSB={setOpenSB} />
    </>
  );
}

export default App;
