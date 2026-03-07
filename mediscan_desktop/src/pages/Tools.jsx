import React, { useState, useEffect } from "react";

import Toast from "../components/Toast.jsx"
import FloatingMenu from '../components/FloatingMenu';

// icons
const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30px">
    <path
      fill="#22c55e"
      d="M14 2H6c-.53 0-1.04.21-1.41.59C4.21 2.96 4 3.47 4 4v16c0 .53.21 1.04.59 1.41.37.38.88.59 1.41.59h12c.53 0 1.04-.21 1.41-.59.38-.37.59-.88.59-1.41V8l-6-6z"
    />
    <path
      fill="#86efac"
      d="M14 2v4c0 .53.21 1.04.59 1.41.37.38.88.59 1.41.59h4l-6-6z"
    />
    <text
      x="12"
      y="16"
      fontSize="5"
      fontWeight="600"
      textAnchor="middle"
      fill="#fff"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      XLS
    </text>
  </svg>
);

const FileStackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60px" height="60px" fill="#1e3a5f">
    <path d="M21 8h2v14H7v-2h1v1h14V9h-1zm-1 11V5h-2v1h1v12H5v-1H4v2zM1 16V2h16v14zm9-1v-2H5v2zm0-8H5v2h5zm-5 3v2h5v-2zm11 3h-5v2h5zm0-3h-5v2h5zm0-3h-5v2h5zM2 6h14V3H2zm0 3h2V7H2zm0 3h2v-2H2zm0 3h2v-2H2z"/>
    <path fill="none" d="M0 0h24v24H0z"/>
  </svg>

);

const Tools = () => {
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null); // toast message
  const [messageType, setMessageType] = useState(null); // to determine if toast is error or warn
  const [isMerging, setIsMerging] = useState(false);
  
  const [cooldownTimer, setCooldownTimer] = useState(0);
  
  
  useEffect(() => {
    if (cooldownTimer > 0) {
      const timerId = setTimeout(() => setCooldownTimer(c => c - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [cooldownTimer]); // used to disable components
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const existingNames = selectedFiles.map(f => f.name);
    
    // filter duplicates
    const newFiles = files.filter(file => {
      if (existingNames.includes(file.name)) {
        setErrorMessage(`Duplicate skipped: ${file.name}`);
        setMessageType("warn");
        return false;
      }
      
      // checks for excel extension
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        setErrorMessage("Only Excel files (.xlsx) allowed!");
        setMessageType("error");
        return false;
      }
      return true;
      
    }).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    // Add to list
    if (selectedFiles.length + newFiles.length > 10) {
      setErrorMessage("Max 10 files allowed");
      setMessageType("error");
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };
  
  const handleRemoveFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const clearError = () => {
    setErrorMessage(null);
    setMessageType(null);
  }
  
  // MAIN FUNCTION
  // function to send request to merge given excel files
  const handleMerge = async () => {
    
    if (selectedFiles.length < 2) return;
    
    setIsMerging(true);
    setErrorMessage(null);
    setMessageType(null);
    
    const formData = new FormData();
    for (let i=0; i<selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i].file);
    }
    
    try {
      // TODO: invoke('merge_excel_files', { files: selectedFiles })
      await new Promise(r => setTimeout(r, 2000)); // Temp delay
      
      setCooldownTimer(5);
      
    } catch (errs) {
      setErrorMessage("Merge failed");
      setMessageType("error");
      setCooldownTimer(5);
      
    } finally {
      setIsMerging(false);
    }
  };
  
  
  
  return (
    
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      
      
      {!isMerging &&
        <FloatingMenu />}
      
      {errorMessage &&
        <Toast
          message={errorMessage}
          type={messageType}
          onClose={clearError} />}
      
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h1 className="text-2xl font-bold relative z-10">Report Merger</h1>
          <p className="text-blue-200 text-sm relative z-10 mt-1">Combine multiple patient lists into one master file.</p>
          <p className="text-blue-200 text-sm relative z-10 mt-1">More tools coming soon...</p>
        </div>
        
        <div className="p-8">
          
          {/* DRAG AND DROP */}
          <label className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 group">
            <input type="file" multiple accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
            
            <div className="group-hover:scale-110 transition-transform duration-300">
              <FileStackIcon />
            </div>
            <p className="text-gray-500 font-medium group-hover:text-blue-600">Click to Browse or Drag Files</p>
            <p className="text-xs text-gray-400 mt-2">Supports .xlsx and .xls</p>
          </label>
          
          {/* FILE LIST AREA */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Queue</span>
              <span className="text-xs font-bold text-gray-400">{selectedFiles.length} / 10</span>
            </div>
            
            {/* List container */}
            <div className="space-y-3 min-h-[100px]">
              {selectedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-300 italic border border-transparent rounded-lg">
                  No files selected yet...
                </div>
              ) : (
                selectedFiles.map((file) => (
                  <div key={file.id} className="flex items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Icon */}
                    <div className="shrink-0 mr-3">
                      <ExcelIcon />
                    </div>
                    {/* Info */}
                    <div className="grow min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{file.size}</p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* MERGE BUTTON */}
          <button
            type="button"
            onClick={handleMerge}
            className="w-full text-center cursor-pointer bg-blue-900 mt-5 hover:bg-[#0d2559] transition-colors duration-500 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border border-slate-500 text-white font-medium group disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            disabled={selectedFiles.length < 2 || selectedFiles.length === 0 || isMerging}
          >
            <div className="relative overflow-hidden">
              <p className="text-center group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                {isMerging ? "Merging..." : "Ready?"}
              </p>
              <p className="w-full text-center absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                  {isMerging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Merge ${selectedFiles.length > 0 ? selectedFiles.length : ""} Files`
                  )}
              </p>
            </div>
          </button>
        
        </div>
      </div>
      
    </div>
  );
};

export default Tools;