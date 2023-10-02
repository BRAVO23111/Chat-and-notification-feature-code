import { useRef, useState } from "react";
import Cookies from "universal-cookie";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";

const Cookie = new Cookies();

function App() {
  const [isAuth, setisAuth] = useState(Cookie.get("auth-token"));
  const [room, setRoom] = useState(null);
  const inputRoomRef = useRef(null);

  const handleSignout = async () => {
    await signOut(auth);
    Cookie.remove("auth-token");
    setisAuth(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-xl mx-auto bg-white p-4 rounded shadow-lg">
        {isAuth ? (
          <>
            {room ? (
              <Chat room={room} />
            ) : (
              <div className="room">
                <label className="text-lg font-semibold mb-2">
                  Enter room number
                </label>
                <div className="flex space-x-2">
                  <input
                    ref={inputRoomRef}
                    className="flex-grow border rounded py-2 px-3"
                  />
                  <button
                    onClick={() => setRoom(inputRoomRef.current.value)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Enter
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={handleSignout}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <Auth setisAuth={setisAuth} />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
