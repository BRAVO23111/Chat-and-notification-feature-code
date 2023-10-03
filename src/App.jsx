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
  const[isphotoURL,setisphotoURL] =useState('')
  const [room, setRoom] = useState(null);
  const inputRoomRef = useRef(null);

  const handleSignout = async () => {
    await signOut(auth);
    Cookie.remove("auth-token");
    setisAuth(false);
  };
  const backgroundImageStyle = {
    backgroundImage: 'url("https://media.istockphoto.com/id/1283724500/vector/social-media-seamless-pattern-doodle-style.jpg?s=612x612&w=0&k=20&c=oVZ7nnt1dHPQhGt4oQrZpVdldIjijwxG7misyIckvA4=")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
  return (
    <div className="bg-gray-100 min-h-screen p-4 w-full font-montserrat" style={backgroundImageStyle}>
      <div className="flex flex-col items-center justify-center h-full w-400px p-4 rounded shadow-lg mt-64 mr-200px ml-200px">
        {isAuth ? (
          <>
            {room ? (
              <Chat room={room} />
            ) : (
              <div className="flex flex-col items-center justify-center font-montserrat font-bold">
              <label className="text-lg mb-2">Create Room</label>
              <div className="flex space-x-2 ml-20">
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
          <Auth setisAuth={setisAuth} setisphotoURL={setisphotoURL} />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
