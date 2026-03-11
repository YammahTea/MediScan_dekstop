import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

import Toast from "../components/Toast.jsx"
import FloatingMenu from '../components/FloatingMenu';

import { useAuth } from '../context/AuthProvider';

const Profile = () => {
  
  const { logout, currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);  
  const [errorMessage, setErrorMessage] = useState(null); // for the toast message
  const [messageType, setMessageType] = useState(null); // to determine if the toast message is an error or warn
  
  
  
  const clearErrorMessage = () => {
    setErrorMessage(null);
    setMessageType(null);
  }
  
  const handleOpenFolder = async (folder_name) => {
    try {

      await invoke('open_results_folder', { folderName: folder_name})
      
    } catch (err) {
      alert(`Could not open folder: ${err}`);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-bold text-gray-500">Loading Profile...</p>
      </div>
    );
  }
  

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
          src={`https://ui-avatars.com/api/?name=${currentUser}&background=random`}
          alt={"User Profile"}
          className="w-32 h-32 mx-auto rounded-full mb-4 shadow-lg"
        />
        
        <h1 className="text-3xl font-bold mb-6">{currentUser}</h1>        
        
        {/* OPEN FOLDER BUTTON FOR SCANNED SHEETS*/}
        <button
          onClick={() => handleOpenFolder("scan")}
          className="w-full bg-blue-100 text-blue-700 font-medium py-3 rounded-xl mb-3 hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          Open Scanned Results Folder
        </button> 

        
        {/* OPEN FOLDER BUTTON FOR MERGED SHEETS*/}
        <button
          onClick={() => handleOpenFolder("merge")}
          className="w-full bg-green-100 text-green-700 font-medium py-3 rounded-xl mb-3 hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          Open Merged Results Folder
        </button> 
        
        
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
