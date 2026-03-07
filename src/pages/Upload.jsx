import { useState, useEffect } from "react";

import LoaderModal from "../components/LoaderModal.jsx"
import Toast from "../components/Toast.jsx"
import FloatingMenu from '../components/FloatingMenu';


const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80px" height="80px">
    <path
      fill="#1e3a5f"
      d="M14 2H6c-.53 0-1.04.21-1.41.59C4.21 2.96 4 3.47 4 4v16c0 .53.21 1.04.59 1.41.37.38.88.59 1.41.59h12c.53 0 1.04-.21 1.41-.59.38-.37.59-.88.59-1.41V8l-6-6z"
    />
    <path
      fill="#8b9dc3"
      d="M14 2v4c0 .53.21 1.04.59 1.41.37.38.88.59 1.41.59h4l-6-6z"
    />
    <rect x="8" y="11" width="8" height="6" fill="#fff" rx="0.5"/>
    <path
      fill="#1e3a5f"
      d="M9.5 15.5l1.5-2 1.5 1.5 2-3 1.5 3.5H9.5z"
    />
    <circle cx="10.5" cy="13" r="0.8" fill="#1e3a5f"/>
  </svg>
);

const Upload = () => {
  
  const [maxImagesCount, setMaxImagesCount] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState(null); // message to display in the toast
  const [messageType, setMessageType] = useState(null); // to determine if the message is a warn or error for the toast
  
  const [cooldownTimer, setCooldownTimer] = useState(0);
  
  const [scanningStatus, setScanningStatus] = useState(null); // for the loader, to show either book animation or success

  useEffect(() => {
    if (cooldownTimer > 0) {
      const timerId = setTimeout(() => setCooldownTimer(c => c - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [cooldownTimer]); // used to disable components (acts like an alarm) but cant pause code exec
  
  // helper function to pause code execution (With the await)
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  

  // HELPER FUNCTIONS

  // checks for dups + remove, check max limit, creates image previews
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const existingFilenames = selectedFiles.map(f => f.name);

    // removes duplicate images
    const uniqueFiles = files.filter(file => {
      if (existingFilenames.includes(file.name)) {
        
        setErrorMessage(`Duplicate file ignored: ${file.name}`);
        setMessageType('warn')
        
        return false;
      }
      return true;
    });

    // Checks if there are duplicate images uploaded
    if (uniqueFiles.length < files.length) {
      const duplicateCount = files.length - uniqueFiles.length;
      
      setErrorMessage(`${duplicateCount} duplicate file(s) ignored`);
      setMessageType('warn')
      
    }

    // Limit to 5 files
    const availableSlots = maxImagesCount - selectedFiles.length;
    if (uniqueFiles.length > availableSlots) {
      alert(`You can only upload ${availableSlots} more image(s). Total limit is ${maxImagesCount}.`);
      return;
    }

    // To create preview URLs for the images with validation
    const newFiles = uniqueFiles.map(file => {

      if (!file.type.startsWith('image/')) {
        console.warn(`${file.name} is not a valid image file`);
        return null;
      }
      
      const isRenderable = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
      
      try {
        return {
          file: file,
          name: file.name,
          preview: isRenderable ? URL.createObjectURL(file) : null,
          isValid: true
        };
      } catch (error) {
        setErrorMessage(`Failed to create preview for ${file.name}: ${error} `)
        setMessageType('warn')
        
        return {
          file: file,
          name: file.name,
          preview: null,
          isValid: false
        };
      }

    }).filter(Boolean);

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // REMOTE CONTROL:
  // The actual <input type="file"> is hidden because it is ugly
  // When the user clicks the "browse" button, this function
  // finds the hidden input by its ID and simulates a click on it
  const handleBrowseClick = () => {
    document.getElementById('file-input').click();
  };

  // helper function to remove files after click x icon
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => {
      // to free memory from object url
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };
  
  const clearErrorMessage = () => {
     setErrorMessage(null);
     setMessageType(null);
  }

  const remainingSlots = maxImagesCount - selectedFiles.length;
  
  
  // MAIN FUNCTION
  const handleUpload = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setMessageType(null);
    
    const formData = new FormData();
    for (let i=0; i<selectedFiles.length; i++) {
      formData.append("images", selectedFiles[i].file);
    }
    
    try {
      setScanningStatus("uploading"); 
        
      // TODO:  invoke('process_images', { files: selectedFiles })
      await wait(2000); // Temp delay for now
      
      setScanningStatus("success"); 
      await wait(2000);
      
      // Clear UI
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview) URL.revokeObjectURL(fileObj.preview);
      });
      setSelectedFiles([]);
      setCooldownTimer(5);
        
    } catch (err) {
      setErrorMessage("Local scan failed.");
      setMessageType("error");
      setCooldownTimer(5);
    } finally {
      setIsSubmitting(false);
      setScanningStatus(null);
    }
    
  };
  
  
  
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      
      <LoaderModal
        isOpen={isSubmitting}
        status={scanningStatus}
      />
      
      {/*So it doesnt appear while scanning */}
      {!isSubmitting &&
        <FloatingMenu/>
      }
      
      
      {errorMessage &&
        <Toast
        message={errorMessage}
        onClose={clearErrorMessage}
        type={messageType}
        />
      }
        
        
        <form className="bg-white shadow-[0_10px_60px_rgb(218,229,255)] border border-[rgb(159,159,160)] rounded-[20px] p-8 pb-6 text-center text-lg max-w-[380px] w-full">
        <h2 className="text-black text-[1.8rem] font-medium">Upload your file</h2>
        <p className="mt-2.5 text-[0.9375rem] text-[rgb(105,105,105)]">
          File should be an image (Max 5 images)
        </p>
        
        {/* Drag and drop area*/}
        <label
          htmlFor="file-input"
          className="bg-[#fafbff] relative flex flex-col justify-center items-center py-10 px-6 mt-[2.1875rem] rounded-xl border-2 border-dashed border-[rgb(100,149,237)] cursor-pointer transition-all duration-300 hover:bg-[rgba(100,149,237,0.05)] hover:border-[rgb(65,105,225)] hover:shadow-[0_4px_12px_rgba(100,149,237,0.15)]"
        >
          <div className="flex flex-col items-center gap-2.5 pointer-events-none">
            <UploadIcon/>
            <span className="text-[#555] text-base font-semibold text-center">
              Drag & drop your files here
            </span>
          </div>
          <input
            type="file"
            accept="image/*, .heic, .heif, .dng, .jpg, .jpeg, .png"
            multiple
            id="file-input"
            className="hidden"
            onChange={handleFileChange}
            disabled={selectedFiles.length >= maxImagesCount}
          />
        </label>
        
        {/* Browse button and file status */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            className="bg-[#0d2559] text-white border-none py-2.5 px-6 rounded-lg text-[0.95rem] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#0d45a5] disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleBrowseClick}
            disabled={selectedFiles.length >= maxImagesCount}
          >
            Browse...
          </button>
          <span className="text-[#999] text-[0.85rem]">
            {selectedFiles.length === 0
              ? 'No file selected.'
              : `${selectedFiles.length} file(s) selected (${remainingSlots} remaining)`
            }
          </span>
        </div>
        
        
        {/* SCAN button */}
        <button
          type="button"
          onClick={handleUpload}
          className="w-full text-center cursor-pointer bg-blue-900 mt-5 hover:bg-[#0d2559] transition-colors duration-500 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border border-slate-500 text-white font-medium group disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          disabled={selectedFiles.length > maxImagesCount || selectedFiles.length === 0}
        >
          <div className="relative overflow-hidden">
            <p className="text-center group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
              {isSubmitting ? "Scanning..." : "Ready?"}
            </p>
            <p className="w-full text-center absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
              {isSubmitting ? "Scanning..." : "Scan!"}
            </p>
          </div>
        </button>
        
        {/* Image previews */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 grid grid-cols-5 gap-2">
            {selectedFiles.map((fileObj, index) => (
              <div key={index} className="relative group">
                {fileObj.isValid && fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt={fileObj.name}
                    className="w-full h-16 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback placeholder for invalid images */}
                <div
                  className="w-full h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-xs text-gray-500"
                  style={{ display: fileObj.isValid && fileObj.preview ? 'none' : 'flex' }}
                >
                  <div className="text-center p-1">
                    <div className="text-red-500 font-bold">⚠</div>
                    <div className="truncate max-w-full">{fileObj.name}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      
      </form>
      
    </div>
    
  
  );
}

export default Upload;