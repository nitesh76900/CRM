import React, { useState, useEffect } from "react";
import authServices from "../../services/authServices";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from "../../store/slices/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState({
    error: "",
    success: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = useSelector(selectUser);

  // Determine the correct dashboard route based on user data
  const getDashboardRoute = (userData) => {
    if (!userData) return "/login";
    
    if (userData.role === "SuperAdmin") {
      return "/super-admin-dashboard";
    } else if (userData.employees) {
      return "/company-dashboard";  // Changed from "/" to "/company-dashboard"
    } else if (userData.company) {
      return "/employee-dashboard";
    }
    return "/login";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authServices.login(formData);
      if (response.token) {
        // Fetch updated user profile after login
        const profileResponse = await authServices.getProfile();
        const userData = profileResponse.user;

        // Dispatch user data to Redux store
        dispatch(setUser(userData));

        // Navigate to the appropriate dashboard based on user role
        const dashboardRoute = getDashboardRoute(userData);
        navigate(dashboardRoute, { replace: true });

        toast.success("Login successful!");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordStatus({ error: "", success: "" });
    setIsSubmitting(true);

    try {
      await authServices.forgotPassword(forgotEmail);
      setForgotPasswordStatus({
        success: "Password reset instructions sent to your email!",
        error: "",
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setForgotEmail("");
        setForgotPasswordStatus({ error: "", success: "" });
      }, 3000);
    } catch (err) {
      setForgotPasswordStatus({
        error: err.message || "Failed to send reset email. Please try again.",
        success: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="relative px-6 py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-black opacity-10" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white text-center">
                Welcome Back
              </h2>
              <p className="mt-3 text-blue-100 text-center text-lg">
                Login to access your account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-center animate-fade-in">
                {success}
              </div>
            )}

            <div className="space-y-6">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400 hover:bg-gray-100"
                required
                disabled={loading}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400 hover:bg-gray-100"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/company-register")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={loading}
                >
                  Register as company
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/employee-register")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={loading}
                >
                  Register as employee
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setForgotEmail("");
                  setForgotPasswordStatus({ error: "", success: "" });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {forgotPasswordStatus.error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
                {forgotPasswordStatus.error}
              </div>
            )}
            {forgotPasswordStatus.success && (
              <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-lg">
                {forgotPasswordStatus.success}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400 hover:bg-gray-100"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
