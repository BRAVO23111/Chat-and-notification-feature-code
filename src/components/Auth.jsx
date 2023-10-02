import React from 'react'
import { auth, Provider } from '../firebase-config'
import { signInWithPopup } from 'firebase/auth'
import Cookies from 'universal-cookie'

const Cookie = new Cookies();
const Auth = ({ setisAuth }) => {
  const signin = async () => {
    try {
      const result = await signInWithPopup(auth, Provider);
      Cookie.set('auth-token', result.user.refreshToken)
      setisAuth(true)
    } catch (err) {
      console.log("error")
    }
  }

  return (
    <div className='auth'>
      <p className="text-xl font-semibold mb-4">Sign in to continue</p>
      <button
        onClick={signin}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default Auth;
