import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AuthPage.css';

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams(); // Getting the token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Now we send the token in the body of the request
      await axios.post(`http://localhost:3000/api/auth/reset-password/${token}`, { password });

      // If successful, show success message and navigate to login page
      toast.success(t('auth.resetSuccess'));
      navigate('/auth'); // Redirect to the login page after reset
    } catch (err) {
      // Handle any errors (e.g. invalid token, expired)
      toast.error(err.response?.data?.message || t('auth.resetError'));
    }
  };

  return (
    <div className="auth-container">
      <h2>{t('auth.resetTitle')}</h2>
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <input
          type="password"
          placeholder={t('auth.newPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t('auth.changePassword')}</button>
      </form>
    </div>
  );
};

export default ResetPassword;
