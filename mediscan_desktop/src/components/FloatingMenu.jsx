import React from 'react';
import { useNavigate } from 'react-router';
import './FloatingMenu.css';

const FloatingMenu = () => {
  const navigate = useNavigate();
  
  return (
    <div className="wrapper">
      <input type="checkbox" id="toogle" className="hidden-trigger" />
      
      {/* The Central Toggle Button */}
      <label htmlFor="toogle" className="circle">
        <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          {/* Simple Plus Icon for the center */}
          <path d="M24 4V44M4 24H44" stroke="" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </label>
      
      <div className="subs">
        
        {/* TOP BUTTON: UPLOAD (Scope) */}
        <button className="sub-circle" onClick={() => navigate('/upload')}>
          
          <input value="1" name="sub-circle" type="radio" id="sub1" className="hidden-sub-trigger" />
          <label htmlFor="sub1" style={{ fontSize: '24px' }}>𖥔</label>
        </button>
        
         {/*LEFT BUTTON: PROFILE (User)*/}
        <button className="sub-circle" onClick={() => navigate('/profile')}>
          
          <input value="2" name="sub-circle" type="radio" id="sub2" className="hidden-sub-trigger" />
          <label htmlFor="sub2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20">
              <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z" fill="none"
                    stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
              <path
                d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z"
                fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/>
            </svg>
          
          </label>
        </button>
        
        {/* TOOLS */}
        <button className="sub-circle" onClick={() => navigate('/tools')}>
          
          <input value="3" name="sub-circle" type="radio" id="sub3" className="hidden-sub-trigger"/>
          <label htmlFor="sub3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/>
            </svg>
          
          </label>
        </button>
      
      </div>
    </div>
  );
};

export default FloatingMenu;
