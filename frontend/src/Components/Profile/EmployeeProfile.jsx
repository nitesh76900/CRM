import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Check,
  Calendar,
  Edit,
} from "lucide-react";
import { updateEmployee } from "../../services/employeeServices";
import { toast, ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, selectUser } from "../../store/slices/userSlice";
// import { updateUserProfile } from "../../store/slices/userSlice";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const UpdateProfileModal = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: profile.user.name,
    designation: profile.designation,
    phoneNo: profile.user.phoneNo,
    address: { ...profile.address },
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(profile.image.url);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
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
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updateData = {
        name: formData.name,
        designation: formData.designation,
        phoneNo: formData.phoneNo,
        address: formData.address,
      };

      const response = await updateEmployee(updateData, selectedFile);
      onUpdate(response.employee);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally{
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/40 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <img
                src={previewImage}
                alt={profile.user.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <label
                htmlFor="imageUpload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer"
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
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-3xl font-bold text-gray-900 w-full border-b border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Address Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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

  React.useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    dispatch(fetchUser());
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        style={{ marginTop: "50px" }}
      />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <img
              src={profile.image.url}
              alt={profile.user.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.user.name}
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
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Existing profile content remains the same */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            {/* Contact Information section */}
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{profile.user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{profile.user.phoneNo}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{profile.company.name}</span>
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
          </Card>

          {/* Existing right-side cards remain the same */}
          <Card className="lg:col-span-2">
            {/* Role & Permissions section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">Role & Permissions</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                  {profile &&
                    profile.role &&
                    profile.role.permissions &&
                    Object.entries(profile.role.permissions).map(
                      ([key, permissions]) => (
                        <div key={key} className="space-y-2">
                          <h3 className="text-lg font-medium capitalize">
                            {key}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(permissions).map(
                              ([action, isAllowed]) =>
                                isAllowed && (
                                  <span
                                    key={action}
                                    className="capitalize text-gray-700 font-medium"
                                  >
                                    {action}
                                  </span>
                                )
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>

            {/* Designation Details section */}
            <div>
              <h2 className="text-xl font-semibold mb-6">
                Designation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="text-gray-700 font-medium">
                    {profile.role.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Designation</label>
                  <p className="text-gray-700 font-medium">
                    {profile.designation}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <p className="text-gray-700 font-medium">
                    {new Date(profile.role.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Update Profile Modal */}
      {isUpdateModalOpen && (
        <UpdateProfileModal
          profile={profile}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
