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
import { FiSend, FiImage, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
        toast.info("New message received", {
          position: "top-right",
          autoClose: 3000,
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex justify-center items-center bg-gray-100"
    >
      <div className="w-full max-w-md h-[36rem] bg-white rounded-xl shadow-2xl flex flex-col">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="text-white hover:text-indigo-200 transition-colors duration-300"
          >
            <FiArrowLeft size={24} />
          </motion.button>
          <h2 className="text-xl font-bold">#{room}</h2>
          <div className="w-6" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          ref={messageListRef}
          className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent"
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start space-x-3"
              >
                <img
                  src={message.avatar || "https://via.placeholder.com/40"}
                  alt={message.user}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 bg-gray-100 rounded-lg p-3">
                  <div className="font-semibold text-gray-800">{message.user}</div>
                  <div className="text-gray-700 mt-1">{message.text}</div>
                  {message.imageUrl && (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={message.imageUrl}
                      alt="Uploaded"
                      className="mt-2 rounded-lg max-w-full h-auto object-cover"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-200 flex items-center space-x-2"
        >
          <input
            type="file"
            onChange={handleImageChange}
            id="imageInput"
            className="hidden"
          />
          <motion.label
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            htmlFor="imageInput"
            className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors duration-300"
          >
            <FiImage size={24} />
          </motion.label>
          <input
            className="flex-grow bg-gray-100 rounded-full py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiSend size={20} />
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default Chat;