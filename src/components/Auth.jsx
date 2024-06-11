import React, { useEffect } from "react";
import { auth, Provider } from "../firebase-config";
import Cookies from "universal-cookie";
import { Helmet } from "react-helmet";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import ClipLoader from "react-spinners/ClipLoader";

const cookies = new Cookies();

const Auth = ({ setIsAuth, setLoading }) => {
  const signin = async () => {
    try {
      setLoading(true);
      await signInWithRedirect(auth, Provider);
    } catch (err) {
      console.error("Error during sign-in:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          cookies.set("auth-token", result.user.refreshToken);
          setIsAuth(true);
        }
      } catch (err) {
        console.error("Error handling redirect result:", err);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        cookies.set("auth-token", user.refreshToken);
        setIsAuth(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setIsAuth, setLoading]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div className="w-full bg-white p-8 rounded shadow-lg text-center font-montserrat">
        <h1 className="text-2xl font-semibold mb-4">Welcome to Connect</h1>
        <p className="text-m mb-4 font-bold">
          Connect is a user-friendly chat application designed to facilitate
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
