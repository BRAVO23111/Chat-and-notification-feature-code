import React, { useState, useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./firebase-config";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiPlus, FiArrowRight } from "react-icons/fi";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState(localStorage.getItem("selectedRoom"));
  const [rooms, setRooms] = useState(JSON.parse(localStorage.getItem("rooms")) || []);
  const inputRoomRef = useRef(null);

  const handleSignOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
    localStorage.removeItem("selectedRoom");
  };

  useEffect(() => {
    if (isAuth) {
      const savedRooms = JSON.parse(localStorage.getItem("rooms")) || [];
      setRooms(savedRooms);
    }
  }, [isAuth]);

  const createRoom = () => {
    const roomName = inputRoomRef.current.value.trim();
    if (roomName && !rooms.includes(roomName)) {
      const updatedRooms = [...rooms, roomName];
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setRoom(roomName);
      localStorage.setItem("selectedRoom", roomName);
    }
  };

  const selectRoom = (roomName) => {
    setRoom(roomName);
    localStorage.setItem("selectedRoom", roomName);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full font-poppins bg-gradient-to-br from-blue-500 to-purple-600"
    >
      <AnimatePresence>
        {isAuth && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onClick={handleSignOut}
            className="fixed top-4 left-4 bg-white text-red-500 rounded-full py-2 px-4 flex items-center shadow-lg hover:bg-red-500 hover:text-white transition duration-300"
          >
            <FiLogOut className="mr-2" />
            Sign out
          </motion.button>
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {isAuth ? (
          <>
            {room ? (
              <Chat room={room} goBack={() => {
                setRoom(null);
                localStorage.removeItem("selectedRoom");
              }} />
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-2xl space-y-6 w-full max-w-md"
              >
                <h1 className="text-2xl font-bold text-gray-800">Create or Join Room</h1>
                <div className="flex space-x-2 w-full">
                  <input
                    ref={inputRoomRef}
                    className="flex-grow border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room name"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createRoom}
                    className="bg-blue-500 text-white rounded-full p-2 transition duration-300 ease-in-out"
                  >
                    <FiArrowRight size={24} />
                  </motion.button>
                </div>
                <div className="w-full">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Previous Rooms</h2>
                  <ul className="space-y-2">
                    {rooms.map((roomName, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="cursor-pointer bg-gray-100 hover:bg-blue-100 rounded-lg p-3 transition duration-300"
                        onClick={() => selectRoom(roomName)}
                      >
                        {roomName}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <Auth setIsAuth={setIsAuth} setLoading={setLoading} />
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
}

export default App;