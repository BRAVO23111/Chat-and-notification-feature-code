import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { toast } from "react-toastify";

// ... Import statements ...

const Chat = ({ room }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageRef = collection(db, "messages");

  useEffect(() => {
    const queryMessage = query(messageRef, where("room", "==", room), orderBy('createdAt'));
    const unsubscribe = onSnapshot(queryMessage, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    if (messages.length > 0) {
      toast.info('You have a new message!', {
        position: "top-right",
        autoClose: 10000, // Close the toast after 3 seconds
      });
    }

    return () => unsubscribe();

  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    await addDoc(messageRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      avatar: auth.currentUser.photoURL,
      room,
    });
    setNewMessage("");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-xl mx-auto bg-white p-4 rounded shadow-lg">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Welcome to {room.toUpperCase()}</h1>
        </div>
        <div className="mb-4 space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-2">
              <img
                src={message.avatar || "URL_TO_DEFAULT_AVATAR"} // Use the user's avatar or a default avatar URL
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="font-semibold">{message.user}:</div>
              <div>{message.text}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              className="flex-grow border rounded py-2 px-3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter your message"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded py-2 px-4"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
