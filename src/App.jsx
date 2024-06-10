import { useRef, useState, useEffect } from "react";
import Cookies from "universal-cookie";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
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
    const fetchRooms = async () => {
      const roomCollection = collection(db, "rooms");
      const roomSnapshot = await getDocs(roomCollection);
      const roomList = roomSnapshot.docs.map(doc => doc.id);
      setRooms(roomList);
      localStorage.setItem("rooms", JSON.stringify(roomList));
    };

    if (isAuth) {
      fetchRooms();
    }
  }, [isAuth]);

  const createRoom = async () => {
    const roomName = inputRoomRef.current.value;
    if (roomName && !rooms.includes(roomName)) {
      const updatedRooms = [...rooms, roomName];
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setRoom(roomName);
      localStorage.setItem("selectedRoom", roomName);
    }
  };

  const backgroundImageStyle = {
    backgroundImage: 'url("https://media.istockphoto.com/id/1283724500/vector/social-media-seamless-pattern-doodle-style.jpg?s=612x612&w=0&k=20&c=oVZ7nnt1dHPQhGt4oQrZpVdldIjijwxG7misyIckvA4=")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="min-h-screen w-full font-montserrat" style={backgroundImageStyle}>
      {isAuth && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 left-4 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Sign out
        </button>
      )}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {isAuth ? (
          <>
            {room ? (
              <Chat room={room} goBack={() => {
                setRoom(null);
                localStorage.removeItem("selectedRoom");
              }} />
            ) : (
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-lg space-y-4">
                <label className="text-xl font-semibold">Create or Join Room</label>
                <div className="flex space-x-4">
                  <input
                    ref={inputRoomRef}
                    className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room name"
                  />
                  <button
                    onClick={createRoom}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Enter
                  </button>
                </div>
                <div className="mt-4 w-full">
                  <h2 className="text-lg font-semibold mb-2">Previous Rooms</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {rooms.map((roomName, index) => (
                      <li
                        key={index}
                        className="cursor-pointer text-blue-500 hover:underline"
                        onClick={() => {
                          setRoom(roomName);
                          localStorage.setItem("selectedRoom", roomName);
                        }}
                      >
                        {roomName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        ) : (
          <Auth setIsAuth={setIsAuth} />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
