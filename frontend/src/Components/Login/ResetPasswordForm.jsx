import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authServices from "../../services/authServices";
import { ToastContainer,toast } from "react-toastify";

const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authServices.checkToken(token);
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
        setMessage("Invalid or expired link.");
        toast.error("Invalid or expired link.")
      }
    };
    verifyToken();
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
      toast.error("Password is required")
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      toast.error("Password must be at least 8 characters long")

    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      toast.error("Please confirm your password")
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      toast.error("Passwords do not match")

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await authServices.resetPassword(
        token,
        formData.password
      );
      setMessage("Password reset successful!");
      toast.success("Password reset successful!")
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(error);
      toast.error(error)
    } finally {
      setLoading(false);
    }
  };

  if (isTokenValid === null) {
    return <div className="text-center text-gray-600">Checking token...</div>;
  }

  if (isTokenValid === false) {
    return <div className="text-center text-red-600 text-xl">{message}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" style={{marginTop:"50px"}} autoClose={3000} />
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1`}
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1`}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`text-sm ${
                message.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              } text-center`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
