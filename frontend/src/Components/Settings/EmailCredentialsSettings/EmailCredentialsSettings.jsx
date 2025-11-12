import React, { useState, useEffect } from 'react';
import { getNodemailerCredentials, updateNodemailerCredentials } from '../../../services/companyServices';
import { FiInfo } from 'react-icons/fi';

const EmailCredentialsSettings = () => {
  const [credentials, setCredentials] = useState({ email: '', appPassword: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await getNodemailerCredentials();
      if (response.credentials) {
        setCredentials(response.credentials);
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No credentials set yet
        setIsEditing(false);
      } else {
        setError('Failed to fetch email credentials');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!credentials.email || !credentials.appPassword) {
      setError('Email and App Password are required');
      return;
    }

    try {
      setIsLoading(true);
      await updateNodemailerCredentials(credentials);
      setSuccess('Email credentials saved successfully!');
      setIsEditing(true);
    } catch (err) {
      setError(err?.response?.data.message || 'Failed to save email credentials');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('appPassword');
    const showPasswordButton = document.getElementById('showPasswordButton');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      showPasswordButton.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      showPasswordButton.textContent = 'Show';
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Email Sender Configuration</h1>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Configure your email sender credentials to enable sending emails from your application.
              {!isEditing && " No email credentials have been set up yet."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <label htmlFor="appPassword" className="block font-medium">
                  Email App Password
                </label>
                <button
                  type="button"
                  className="ml-2 text-blue-500 hover:text-blue-700"
                  onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                >
                  <FiInfo size={18} />
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="password"
                  id="appPassword"
                  name="appPassword"
                  value={credentials.appPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="16-character app password"
                />
                <button
                  id="showPasswordButton"
                  type="button"
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={togglePasswordVisibility}
                >
                  Show
                </button>
              </div>
            </div>

            {showPasswordInfo && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold mb-2">How to Generate an App Password:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Go to Google Account Security Settings</strong>: Open your Google Account Security page.</li>
                  <li><strong>Enable 2-Step Verification</strong>: Scroll down to the "Signing in to Google" section and ensure 2-Step Verification is turned on. If not, enable it first.</li>
                  <li>
                    <strong>Generate an App Password</strong>:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Click on "App Passwords" (This option appears only if 2-Step Verification is enabled).</li>
                      <li>Sign in again if prompted.</li>
                      <li>Select the app (e.g., "Mail") and the device (e.g., "Windows Computer") from the dropdown menu.</li>
                      <li>Click "Generate" to get a 16-character password.</li>
                    </ul>
                  </li>
                  <li><strong>Copy and Use the Password</strong>: Copy the generated App Password and use it in your application instead of your regular Google account password.</li>
                </ol>
                <p className="mt-2 text-sm text-gray-600">Ensure you store the App Password securely, as Google won't show it again after you close the window.</p>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isEditing ? 'Update Email Credentials' : 'Save Email Credentials'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EmailCredentialsSettings;