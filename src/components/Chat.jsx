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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { auth, db, storage } from "../firebase-config";
import { toast } from "react-toastify";
import { FiSend, FiImage } from "react-icons/fi";

const Chat = ({ room, goBack }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const messageRef = collection(db, "messages");
  const messageListRef = useRef(null);

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

      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }

      if (newMessages.length > 0) {
        toast.info("You have a new message!", {
          position: "top-right",
          autoClose: 10000,
        });
      }
    });

    return () => unsubscribe();
  }, [room]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    let imageUrl = "";
    if (image) {
      const imageName = `${uuidv4()}-${image.name}`;
      const imageRef = ref(storage, `images/${imageName}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(messageRef, {
      text: newMessage,
      imageUrl,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      avatar: auth.currentUser.photoURL,
      room,
    });

    setNewMessage("");
    setImage(null);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="w-96 h-[32rem] bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col justify-between">
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chat Room: {room.toUpperCase()}</h2>
          <button
            onClick={goBack}
            className="bg-gray-200 text-gray-800 rounded-full p-2 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" ref={messageListRef}>
          {messages.map((message) => (
            <div key={message.id} className="mb-4 flex items-start">
              <img
                src={message.avatar || "URL_TO_DEFAULT_AVATAR"}
                alt="User"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{message.user}</div>
                <div className="text-gray-600">{message.text}</div>
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="mt-2 rounded-lg max-w-full h-auto"
                    style={{ maxHeight: "150px" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center p-4 border-t border-gray-200"
        >
          <input
            type="file"
            onChange={handleImageChange}
            id="imageInput"
            className="hidden"
          />
          <label htmlFor="imageInput" className="cursor-pointer">
            <FiImage className="text-gray-600 hover:text-gray-800 mr-2" size={24} />
          </label>
          <input
            className="flex-grow border rounded-lg py-2 px-3 text-gray-800"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your message"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 ml-2 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FiSend size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
