import React, { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Check,
  Calendar,
  Edit,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, selectUser } from "../../store/slices/userSlice";
import updateCompanyService from "../../services/companyServices";
// Custom Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
};

// Update Modal Component
const UpdateProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phoneNo: profile.phoneNo || "",
    industry: profile.industry || "",
    address: {
      city: profile.address?.city || "",
      state: profile.address?.state || "",
      country: profile.address?.country || "",
      pincode: profile.address?.pincode || "",
    },
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(profile.image.url);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "address") {
      // Update specific address field
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [e.target.getAttribute("data-field")]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create a temporary preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await updateCompanyService(formData, formData.image);
      toast.success("Profile updated successfully!");
      onUpdate(response.company);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      console.error(error);
    } finally {
      isUpdating(false);
    }
  };

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/40 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="address"
                data-field="city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="address"
                data-field="state"
                value={formData.address.state}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="address"
                data-field="country"
                value={formData.address.country}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                name="address"
                data-field="pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>
          <div className="relative">
            <img
              src={previewImage}
              alt={formData?.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-0 left-17 bg-blue-500 text-white rounded-full p-1 cursor-pointer"
            >
              <Edit size={16} />
              <input
                type="file"
                id="imageUpload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
    disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    dispatch(fetchUser());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <img
              src={profile.image.url}
              alt={profile.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Check size={16} />
                  {profile.verify}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
            >
              <Edit size={16} /> Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{profile.phoneNo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{profile.industry}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-600">{profile.address.city}</p>
                    <p className="text-gray-600">
                      {profile.address.state}, {profile.address.country}
                    </p>
                    <p className="text-gray-600">{profile.address.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Column - Detailed Info */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6">Owner Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="text-gray-700 font-medium">
                      {profile.owner.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-700 font-medium">
                      {profile.owner.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="text-gray-700 font-medium">
                      {profile.owner.phoneNo}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="text-gray-700 font-medium">
                      {profile.owner.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Update Profile Modal */}
      {isUpdateModalOpen && (
        <UpdateProfileModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          profile={profile}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
