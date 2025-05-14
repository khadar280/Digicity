import React, { useState, useContext } from 'react';
import './AuthPage.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setToken } = useContext(UserContext);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const handleAuth = async (e, actionType) => {
  e.preventDefault();

  const endpoint = `http://localhost:3000/api/auth/${actionType}`;

  const payload =
    actionType === 'signin'
      ? { email: loginEmail, password: loginPassword }
      : { name: signupName, email: signupEmail, password: signupPassword };

  console.log('[DEBUG] Payload:', payload); 

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Failed to ${actionType}`);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);

    toast.success(t(`auth.${actionType}Success`));
    navigate('/profile');
  } catch (err) {
    toast.error(err.message || t(`auth.${actionType}Error`));
  }
};


  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>
          {t('auth.login')}
        </button>
        <button className={activeTab === 'signup' ? 'active' : ''} onClick={() => setActiveTab('signup')}>
          {t('auth.signup')}
        </button>
      </div>

      <div className="auth-form">
        {activeTab === 'login' ? (
          <form onSubmit={(e) => handleAuth(e, 'signin')} className="auth-form-inner">
            <input
              type="email"
              placeholder={t('auth.email')}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t('auth.password')}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">{t('auth.login')}</button>
            <p className="auth-forgot">
              <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={(e) => handleAuth(e, 'signup')} className="auth-form-inner">
            <input
              type="text"
              placeholder={t('auth.name')}
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder={t('auth.email')}
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t('auth.password')}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
            />
            <button type="submit">{t('auth.signup')}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
