import './LoaderModel.css'
import React from "react";

const SuccessAnimate = () => {
  return (
    <>
      {/* The success animation, you can find it at https://uiverse.io/kyle1dev/average-skunk-3*/}
      <div className="modern-success-message">
        
        
        <div className="icon-wrapper">
          <svg
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="success-icon"
          >
            <path d="M9 12l2 2 4-4"></path>
            <circle r="10" cy="12" cx="12"></circle>
          </svg>
        </div>
        
        <div className="text-wrapper">
          <div className="title">Success</div>
          <div className="message">Operation completed successfully</div>
        </div>
      
      
      </div>
    
    </>

  );
};

export default SuccessAnimate;