import React, { useState, useEffect } from 'react';

import Toast from "../components/Toast.jsx"
import FloatingMenu from '../components/FloatingMenu';

import { useAuth } from '../context/AuthProvider';

const Profile = () => {
  
  const { logout } = useAuth();
  
  const profileData = { username: "Doctor", email: "cat@meow.com", is_unlimited: true }; // temp
  const [loading, setLoading] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState(null); // for the toast message
  const [messageType, setMessageType] = useState(null); // to determine if the toast message is an error or warn
  
  
  
  const clearErrorMessage = () => {
    setErrorMessage(null);
    setMessageType(null);
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-bold text-gray-500">Loading Profile...</p>
        {/* TO DO: SPINNER */}
      </div>
    );
  }

    
  // To display the remaining number of requests
  const calculateRequests= profileData.max_requests - profileData.request_count

  return (
    
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 pb-24">
      {errorMessage &&
        <Toast
          message={errorMessage}
          onClose={clearErrorMessage}
          type={messageType}
        />
      }
      {/*  PROFILE CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center mb-6 relative">
        
        {/* Avatar Logic */}
        <img
          src={`https://ui-avatars.com/api/?name=${profileData.username}&background=random`}
          alt={"User Profile"}
          className="w-32 h-32 mx-auto rounded-full mb-4 shadow-lg"
        />
        
        <h1 className="text-3xl font-bold mb-2">{profileData.username}</h1>
        <p className="text-gray-500 mb-6">{profileData.email}</p>
        
        
        <div className="bg-gray-50 p-6 rounded-xl mb-6 text-left shadow-inner">
          {/* If Unlimited: Show "Premium User" badge */}
          
          {profileData?.is_unlimited ?
            (
            
            <div className="flex items-center justify-start w-full">
              <button className="Btn"> {/* from index.css */}
                <svg className="logoIcon" height="1em" viewBox="0 0 576 512">
                  <path
                    d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"></path>
                </svg>
                <span className="tooltip">Premium</span>
              </button>
              
              <p className="text-black ml-2">Unlimited usage!</p>
            </div>
            )
             :
            (
            
            <div className="flex flex-col w-full">
              
              <p>Temp</p> {/* TEMP */}
              
            </div>
            )
          }
        </div>
        
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white border border-red-100 font-bold py-2 px-4 rounded-xl hover:bg-red-700 hover:text-white transition cursor-pointer"
        >
          Logout
        </button>
      </div>
      
      <FloatingMenu/>
    
    
    </div>
  );
};

export default Profile;
