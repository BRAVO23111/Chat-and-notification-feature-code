import React from "react";
import { auth, Provider } from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import Cookies from "universal-cookie";
import { Helmet } from "react-helmet";

const Cookie = new Cookies();
const Auth = ({ setisAuth }) => {
  const signin = async () => {
    try {
      const result = await signInWithPopup(auth, Provider);
      Cookie.set("auth-token", result.user.refreshToken);
      console.log(result.user.photoURL);
      setisAuth(true);
    } catch (err) {
      console.log("error");
    }
  };

  const backgroundImageStyle = {
    backgroundImage: 'url("img.jpeg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
    
      className="flex justify-center items-center"
    >
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div className="w-full bg-white p-8 rounded shadow-lg text-center font-montserrat ">
        <h1 className="text-2xl font-semibold font-monsterat  mb-4">Welcome to CHATTY</h1>
        <p className="text-m mb-4 font-bold">
          Chatty is a user-friendly chat application designed to facilitate
          seamless communication among friends and users within a shared virtual
          space.
        </p>
        <p className="text-xl font-semibold mb-4">Sign in to enter the room</p>
        <button
          onClick={signin}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Auth;
