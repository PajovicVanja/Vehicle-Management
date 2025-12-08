import React, { useState } from 'react';
import '../CSS/LoginRegister.css';
import { auth, db } from '../firebaseClient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import UploadLicense from './UploadLicense';

function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showUploadLicense, setShowUploadLicense] = useState(false);
  const [uploadToken, setUploadToken] = useState(null); // <-- keep token for UploadLicense

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get a fresh ID token once
      const idToken = await user.getIdToken();
      setToken(idToken);
      setUploadToken(idToken);

      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'Driver',
        createdAt: new Date().toISOString(),
      });

      // Show Upload License step
      setShowUploadLicense(true);
      setError('');
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err.message);
    }
  };

  if (showUploadLicense) {
    return <UploadLicense token={uploadToken || ''} />;
  }

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <span 
            className="password-toggle-icon" 
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye Slash Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Eye Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </span>
        </div>
        <button type="submit" className="login-button">
          Register
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;
