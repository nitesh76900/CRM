import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import {
  Mail,
  Phone,
  User,
//   UserShield,
  Calendar,
  Check,
  AlertCircle,
} from "lucide-react";

const Card = ({ children, className = "" }) => {
  return <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>{children}</div>;
};

const SuperAdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Section */}
      <div className="bg-white shadow p-6 rounded-lg max-w-4xl mx-auto">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Contact Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <ProfileField icon={<Mail />} label="Email" value={profile.email} />
            <ProfileField icon={<Phone />} label="Phone" value={profile.phoneNo} />
            <ProfileField icon={<User />} label="Role" value={profile.role} />
          </div>
        </Card>

        {/* Dates Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-3">
            <ProfileField
              icon={<Calendar />}
              label="Joined"
              value={new Date(profile.createdAt).toLocaleDateString()}
            />
            <ProfileField
              icon={<Calendar />}
              label="Updated"
              value={new Date(profile.updatedAt).toLocaleDateString()}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-gray-700">
    <div className="text-blue-500 text-xl">{icon}</div>
    <p className="text-lg">
      <strong>{label}:</strong> {value}
    </p>
  </div>
);

export default SuperAdminProfile;
