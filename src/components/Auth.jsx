import React, { useEffect, useState } from "react";
import { auth, Provider } from "../firebase-config";
import Cookies from "universal-cookie";
import { Helmet } from "react-helmet";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { BsChatDots } from "react-icons/bs";

const cookies = new Cookies();

const Auth = ({ setIsAuth, setLoading }) => {
  const [localLoading, setLocalLoading] = useState(false);

  const signin = async () => {
    try {
      setLoading(true);
      setLocalLoading(true);
      const result = await signInWithPopup(auth, Provider);
      if (result && result.user) {
        cookies.set("auth-token", result.user.refreshToken);
        setIsAuth(true);
      }
    } catch (err) {
      console.error("Error during sign-in:", err);
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        cookies.set("auth-token", user.refreshToken);
        setIsAuth(true);
        setLoading(false);
        setLocalLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setIsAuth, setLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600"
    >
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl text-center font-poppins"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <BsChatDots className="text-blue-500 text-4xl" />
        </motion.div>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4 text-gray-800"
        >
          Welcome to Connect
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-6 text-gray-600"
        >
          Connect is a user-friendly chat application designed to facilitate
          seamless communication among friends and users within a shared virtual
          space.
        </motion.p>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-semibold mb-6 text-gray-700"
        >
          Sign in to enter the room
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signin}
          className="bg-white border border-gray-300 text-gray-700 py-2 px-6 rounded-full transition duration-300 ease-in-out flex items-center justify-center w-full"
          disabled={localLoading}
        >
          {localLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full"
            />
          ) : (
            <>
              <FcGoogle className="mr-2 text-xl" />
              Sign in with Google
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Auth;