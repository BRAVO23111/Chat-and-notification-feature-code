import React, { useState, useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "./firebase-config";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLogOut,
  FiPlus,
  FiArrowRight,
  FiLock,
  FiUnlock,
  FiUsers,
  FiShare2,
  FiCopy,
} from "react-icons/fi";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import RoomMembers from "./components/RoomMembers";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState(localStorage.getItem("selectedRoom"));
  const [rooms, setRooms] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
  const [joinRoomName, setJoinRoomName] = useState("");
  const inputRoomRef = useRef(null);

  // Fetch rooms from Firestore
  useEffect(() => {
    if (!isAuth) return;

    const roomsQuery = query(
      collection(db, "rooms"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      roomsQuery,
      (snapshot) => {
        const roomsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsData);
        // localStorage.setItem("rooms", JSON.stringify(roomsData));
      },
      (error) => {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms");
      }
    );

    return () => unsubscribe();
  }, [isAuth]);

  const handleSignOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    localStorage.clear("rooms");
    setIsAuth(false);
    setRoom(null);
    localStorage.removeItem("selectedRoom");
  };

  const createRoom = async () => {
    const roomName = inputRoomRef.current.value.trim();

    if (!roomName) {
      toast.error("Please enter a room name");
      return;
    }

    // Check if room name already exists
    const roomQuery = query(
      collection(db, "rooms"),
      where("name", "==", roomName)
    );
    const roomSnapshot = await getDocs(roomQuery);

    if (!roomSnapshot.empty) {
      toast.error("Room already exists");
      return;
    }

    if (isPrivate && securityCode.length !== 4) {
      toast.error("Please enter a 4-digit security code");
      return;
    }

    try {
      setLoading(true);
      const roomData = {
        name: roomName,
        isPrivate,
        code: isPrivate ? securityCode : null,
        creatorId: auth.currentUser.uid,
        creatorEmail: auth.currentUser.email,
        createdAt: new Date().toISOString(),
        members: [auth.currentUser.uid], // Creator is automatically a member
      };

      const docRef = await addDoc(collection(db, "rooms"), roomData);
      setRoom({ id: docRef.id, ...roomData });
      inputRoomRef.current.value = "";
      setSecurityCode("");
      setIsPrivate(false);
      toast.success("Room created successfully!");
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const attemptJoinRoom = (roomData) => {
    if (!roomData.isPrivate) {
      selectRoom(roomData);
    } else if (
      roomData.creatorId === auth.currentUser.uid ||
      roomData.members.includes(auth.currentUser.uid)
    ) {
      selectRoom(roomData);
    } else {
      setSelectedRoomToJoin(roomData);
      setShowJoinModal(true);
    }
  };

  const updateRoomMembers = async (roomId, newMemberId) => {
    try {
      const roomref = doc(db, "rooms", roomId);
      const roomsnap = await getDocs(roomref);

      if (roomsnap.exist()) {
        const currMembers = roomsnap.data().members || [];
        if (!currMembers.includes(newMemberId)) {
          await updateDoc(roomref, {
            members: [...currMembers, newMemberId],
          });
        }
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (selectedRoomToJoin.code === joinCode) {
      try {
        await updateRoomMembers(selectedRoomToJoin.id, auth.currentUser.uid);

        // Update the local state with the new member
        const updatedRoom = {
          ...selectedRoomToJoin,
          members: [...selectedRoomToJoin.members, auth.currentUser.uid],
        };

        selectRoom(updatedRoom);
        setShowJoinModal(false);
        setJoinCode("");
        toast.success("Successfully joined the room!");
      } catch (error) {
        console.error("Error joining room:", error);
        toast.error("Failed to join room");
      }
    } else {
      toast.error("Incorrect security code");
    }
  };

  const handleJoinByCode = async () => {
    try {
      const roomQuery = query(
        collection(db, "rooms"),
        where("name", "==", joinRoomName),
        where("isPrivate", "==", true)
      );
      const roomSnapshot = await getDocs(roomQuery);

      if (roomSnapshot.empty) {
        toast.error("Room not found");
        return;
      }

      const roomDoc = roomSnapshot.docs[0];
      const roomData = { id: roomDoc.id, ...roomDoc.data() };

      if (roomData.code === joinCode) {
        await updateRoomMembers(roomDoc.id, auth.currentUser.uid);

        // Update the local state with the new member
        const updatedRoom = {
          ...roomData,
          members: [...roomData.members, auth.currentUser.uid],
        };

        selectRoom(updatedRoom);
        setShowJoinByCodeModal(false);
        setJoinCode("");
        setJoinRoomName("");
        toast.success("Successfully joined the room!");
      } else {
        toast.error("Incorrect security code");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  const copyRoomDetails = (room) => {
    const details = `Room Name: ${room.name}\nSecurity Code: ${room.code}`;
    navigator.clipboard
      .writeText(details)
      .then(() => toast.success("Room details copied to clipboard!"))
      .catch(() => toast.error("Failed to copy room details"));
  };

  const selectRoom = (roomData) => {
    setRoom(roomData);
    localStorage.setItem("selectedRoom", roomData.name);
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
              <Chat
                room={room.name}
                roomId={room.id}
                goBack={() => {
                  setRoom(null);
                  localStorage.removeItem("selectedRoom");
                }}
              />
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-2xl space-y-6 w-full max-w-md"
              >
                <h1 className="text-2xl font-bold text-gray-800">
                  Create or Join Room
                </h1>

                {/* Create Room Section */}
                <div className="space-y-4 w-full">
                  <input
                    ref={inputRoomRef}
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room name"
                  />

                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-500"
                      />
                      <span className="text-gray-700">Private Room</span>
                    </label>
                    {isPrivate ? <FiLock /> : <FiUnlock />}
                  </div>

                  {isPrivate && (
                    <input
                      type="password"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4-digit security code"
                    />
                  )}

                  <button
                    onClick={createRoom}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-blue-600 transition duration-300"
                  >
                    {loading ? (
                      "Creating..."
                    ) : (
                      <>
                        <FiPlus className="mr-2" />
                        Create Room
                      </>
                    )}
                  </button>
                </div>

                {/* Join Room Section */}
                <div className="w-full space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Available Rooms
                  </h2>

                  {rooms.length > 0 ? (
                    <ul className="w-full space-y-2">
                      {rooms.map((roomData) => (
                        // In your room list item
                        <li
                          key={roomData.id}
                          className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <FiUsers />
                            <span>{roomData.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RoomMembers room={roomData} />
                            <button
                              onClick={() => attemptJoinRoom(roomData)}
                              className="bg-blue-500 text-white rounded-lg py-1 px-3 flex items-center hover:bg-blue-600 transition duration-300"
                            >
                              {roomData.isPrivate ? (
                                <FiLock className="mr-1" />
                              ) : (
                                <FiArrowRight />
                              )}
                              Join
                            </button>
                            {roomData.isPrivate && (
                              <button
                                onClick={() => copyRoomDetails(roomData)}
                                className="bg-gray-300 rounded-lg py-1 px-2 hover:bg-gray-400 transition duration-300"
                              >
                                <FiCopy />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No rooms available</p>
                  )}
                </div>

                {/* Join by Code Section */}
                <button
                  onClick={() => setShowJoinByCodeModal(true)}
                  className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-gray-300 transition duration-300"
                >
                  <FiArrowRight className="mr-2" />
                  Join with Room Name & Code
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <Auth setIsAuth={setIsAuth} setLoading={setLoading} />
        )}
      </div>

      <ToastContainer />

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">
                Enter Room Security Code
              </h2>
              <input
                type="password"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={4}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="4-digit security code"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleJoinPrivateRoom}
                  className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-blue-600 transition duration-300"
                >
                  Join Room
                </button>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Room by Name & Code Modal */}
      <AnimatePresence>
        {showJoinByCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">
                Join Room with Name & Security Code
              </h2>
              <input
                type="text"
                value={joinRoomName}
                onChange={(e) => setJoinRoomName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Room Name"
              />
              <input
                type="password"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={4}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="4-digit security code"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleJoinByCode}
                  className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-blue-600 transition duration-300"
                >
                  Join Room
                </button>
                <button
                  onClick={() => setShowJoinByCodeModal(false)}
                  className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 px-4 flex items-center justify-center shadow-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
