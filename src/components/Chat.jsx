import React, { useState, useEffect, useRef } from "react";
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

const Chat = ({ room }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageRef = collection(db, "messages");
  const messageListRef = useRef(null); // Ref for scrolling to the bottom

  useEffect(() => {
    const queryMessage = query(
      messageRef,
      where("room", "==", room),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(queryMessage, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);

      // Scroll to the latest message when new messages arrive
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }

      // Display toast for new messages
      if (newMessages.length > 0) {
        toast.info("You have a new message!", {
          position: "top-right",
          autoClose: 10000, // Close the toast after 10 seconds
        });
      }
    });

    return () => unsubscribe();
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
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
    <div className="bg-gray-100 p-4 justify-center">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome to {room.toUpperCase()}</h1>
      </div>
      <div className="max-w-xl mx-auto bg-white p-4 rounded shadow-lg">
        <div
          className="mb-4 space-y-4"
          style={{
            maxHeight: "300px", // Adjust the maximum height as needed
            overflowY: "auto", // Enable vertical scrolling
          }}
          ref={messageListRef}
        >
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-2">
              <img
                src={message.avatar || "URL_TO_DEFAULT_AVATAR"}
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
              style={{
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded py-2 px-4"
              style={{
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
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
