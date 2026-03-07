import React from 'react';

import BookAnimate from "./BookAnimate.jsx";
import SuccessAnimate from "./SuccessAnimate.jsx";

const LoaderModal = ({ isOpen, status }) => {
  if (!isOpen) return null;
  
  return (
  
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center min-w-[300px]">
        {isOpen ? (
          status === 'success' ? (
            <SuccessAnimate  />
          ) : (
            <BookAnimate />
          )
        ) : null}
      </div>

    </div>
  );
};

export default LoaderModal;