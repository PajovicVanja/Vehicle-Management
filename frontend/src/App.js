import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ReserveVehicle from './components/ReserveVehicle';
import AddVehicle from './components/AddVehicle';
import UploadLicense from './components/UploadLicense';
import CurrentReservationsAdmin from './components/CurrentReservationsAdmin';
import ViewReservation from './components/ViewReservation';
// A/B Test Imports
import ReserveVehicleB from './components/ReserveVehicleB';
import ViewReservationB from './components/ViewReservationB';
import { getUserData } from './services/authService';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication

import { getReservationData } from './services/reservationService';

import browsee from '@browsee/web-sdk';

// ... other imports

function App() {
  const [token, setToken] = useState(null); // Auth token
  const [role, setRole] = useState(''); // User role (Driver, Admin, Manager)
  const [licenseUploaded, setLicenseUploaded] = useState(false); // Driver's license status

  // UI Navigation States
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReserve, setShowReserve] = useState(false); // Used for viewing vehicles
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAllCarReservations, setShowAllCarReservations] = useState(false);
  
  // A/B Test Variant State
  const [isVersionB, setIsVersionB] = useState(false);

  // Check for variant query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isB = params.get('variant') === 'B';
    if (isB) {
      setIsVersionB(true);
      if (browsee && typeof browsee.addEvent === 'function') {
         browsee.addEvent('AB_Test_Variant', { variant: 'B' });
      }
    } else {
        if (browsee && typeof browsee.addEvent === 'function') {
           browsee.addEvent('AB_Test_Variant', { variant: 'A' });
        }
    }
  }, []);

  //Reservation form
  const [uid, setUid] = useState(null);
  const [reservations, setReservations] = useState([]); 
  const [userReservation, setUserReservation] = useState(null);

  // Fetch role and license status after login
  // Fetch role and license status after login
  const refreshUserData = useCallback(async () => {
      if (token) {
        const userData = await getUserData(token);
        if (userData.success) {
          setRole(userData.data.role || 'Driver');
          setLicenseUploaded(!!userData.data.licenseImageUrl);

          const fetchAllReservations = async () => {
            try {
              const vehicleSnapshot = await getReservationData(token);
              if (vehicleSnapshot.success) {
                setReservations(vehicleSnapshot.data);
              }
            } catch (error) {
              console.log(error);
            }
          };

          fetchAllReservations();
          // Get the authenticated user's UIDd
          const auth = getAuth();
          const user = auth.currentUser;
          user ? setUid(user.uid) : setUid(null);
        }
      }
  }, [token]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  useEffect(() => {
    // Fetch user reservation only after `reservations` and `uid` have been set
    if (reservations.length > 0 && uid) {
      const userRes = reservations.find(res => res.userId === uid);
      setUserReservation(userRes);
    }
  }, [reservations, uid]);
  
  return (
    <div className="app-main-container">
      <h1>Vehicle Management System</h1>
      {!token ? (
        <div className="auth-container">
          {/* Register or Login UI */}
          {showRegister ? (
            <Register setToken={setToken} />
          ) : (
            <Login setToken={setToken} />
          )}
          <button
            className="goto-register-button"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </div>
      ) : showAddVehicle ? (
        <AddVehicle token={token} setShowAddVehicle={setShowAddVehicle} />
      ) : showReserve ? (
        isVersionB ? (
             <ReserveVehicleB
                token={token}
                setShowReserve={setShowReserve}
                setShowAddVehicle={setShowAddVehicle}
                setShowAllCarReservations={setShowAllCarReservations}
                canReserve={role === 'Driver'} 
                userReservationReset={setUserReservation}
                onRefresh={refreshUserData}
                onSuccess={() => {
                  setShowReserve(false);
                  setShowAddVehicle(false);
                }}
              />
        ) : (
             <ReserveVehicle
                token={token}
                setShowReserve={setShowReserve}
                setShowAddVehicle={setShowAddVehicle}
                setShowAllCarReservations={setShowAllCarReservations}
                canReserve={role === 'Driver'} 
                userReservationReset={setUserReservation}
                onRefresh={refreshUserData}
                onSuccess={() => {
                  setShowReserve(false);
                  setShowAddVehicle(false);
                }}
            />
        )
      ) : showProfile ? (
        <Profile token={token} setShowProfile={setShowProfile} />
      ) : showAllCarReservations ? (
        <CurrentReservationsAdmin
          token={token}
          setShowAllCarReservations={setShowAllCarReservations}
        />
      ) : (
        <div className="menu-group">
          {/* Show UploadLicense for Drivers who haven't uploaded it */}
          {role === 'Driver' && !licenseUploaded && (
            <UploadLicense token={token} />
          )}
          {/* Show the active reservation, if it exists */}
          {userReservation ? (
            isVersionB ? (
                <ViewReservationB
                  token={token}
                  reservationData={userReservation}
                  onReservationCleared={() => setUserReservation(null)}  
                  onRefresh={refreshUserData}
                />
            ) : (
                <ViewReservation
                  token={token}
                  reservationData={userReservation}
                  onReservationCleared={() => setUserReservation(null)}  
                  onRefresh={refreshUserData}
                />
            )
          ) : (<></>)}
          <div className="button-group">
            <button
              onClick={() => setShowProfile(true)}
              className="goto-register-button"
            >
              View Profile
            </button>
            <button
              onClick={() => setShowReserve(true)}
              className="goto-register-button"
            >
              {role === 'Driver' ? 'Reserve Vehicle' : 'View Vehicles'}
            </button>
            {/* Admin and Manager options */}
            {(role === 'Admin' || role === 'Manager') && (
              <button
                onClick={() => setShowAllCarReservations(true)}
                className="goto-register-button"
              >
                View All Reservations
              </button>
            )}
            <button
              onClick={() => {
                // Log out user
                setToken(null);
                setRole('');
                setShowProfile(false);
                setShowReserve(false);
                setShowAddVehicle(false);
                setShowAllCarReservations(false);
              }}
              className="goto-register-button"
            >
              Log Out
            </button>
          </div>

          <div className="survey-container">
            <a 
              href={isVersionB ? "https://1ka.arnes.si/a/b236ac55" : "https://1ka.arnes.si/a/6ca42afa"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-survey"
            >
              Take our Usability Survey
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
