import { useState } from 'react'
import '../App.css'

import { useAuth } from '../context/AuthProvider';


function LoginScreen() {
  const {login} = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowPassword(false);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleBackToEmail = () => {
    setShowPassword(false);
  };

  const handleContact = () => {
    const email = "mahmoud.aldaoud.se@gmail.com"; // yes this is my email if u are reading this :)
    
    const subject = encodeURIComponent("Access request: MediScan");
    const body = encodeURIComponent("Hello Developer, \n\nI am a doctor and would like to request access to the application.\n\nMy details:\nName:\nHospital/Clinic:\nExtra details(Optional):\n\n If you are not a doctor and would like a temporary access, you can still apply but please state your access reason");
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault(); // so clicking 'enter' works
    login(username, password);
    // dont forget that AuthPorvider updates the token automaticaly
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="form-container">
        <form className={`form ${showRegister ? 'show-register' : ''}`} onSubmit={handleSubmit} >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="lock-icon"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            strokeWidth="0"
            fill="currentColor"
            stroke="currentColor"
          >
            <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 0 1 .567-3.677A2.001 2.001 0 0 1 14 16a1.99 1.99 0 0 1-1 1.723z"></path>
          </svg>

          <input
            className="toggle-input"
            id="toggle-checkbox"
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />

          <p className="form-title">
            {showRegister ? 'Register an account' : 'Welcome back'}
          </p>
          <p className="form-sub-title">
            {showRegister
              ? (
                <>
                  This is an invite only website, please contact the{' '}
                  <a href="https://github.com/YammahTea" className="register-link" target="_blank">
                    developer
                  </a>
                  {' '}to gain access, only verified doctors can get an access account.
                  {' '}If you are not a doctor, you can still ask for a temporary access account.
                </>
              )
              : 'Glad to see you again Login to your account below.'
            }
          </p>

          <div className="cards-wrapper">
            <div className="login-card">
              <div className="field-container">
                
                <input placeholder=""
                       className="input"
                       type="text"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       required
                       minLength={5}/>
                
                <span className="placeholder">Username or email</span>
                
              </div>

              <div className="field-container">
                
                <input placeholder=""
                       className="input"
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       minLength={5}/>
                
                <span className="placeholder">Password</span>
                
              </div>

              <div className="button-row">
                <div className="register-position">
                  <span className="register-link" onClick={handleRegisterClick}>
                  Register
                </span>
                </div>

                <button className="btn" type="submit">
                  <span className="btn-label">Continue</span>
                </button>
              </div>
            </div>

            <div className="register-card">
              <div className="button-row absolute top-50 left-0 bottom-0 right-0" style={{ width: '100%', justifyContent: 'center'}}>
                <button className="btn" type="button" onClick={handleBackToLogin}>
                  <span className="btn-label">Back</span>
                </button>
                <button className="btn" type="button" onClick={handleContact}>
                  <span className="btn-label">Contact</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;