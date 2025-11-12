import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";

const Navbar = () => {
  const [profileLink, setProfileLink] = useState("");
  const user = useSelector(selectUser);
  useEffect(() => {
    if (user && user.company) {
      setProfileLink("/employee-profile");
    } else if (user && user.employees) {
      setProfileLink("/company-profile");
    } else if (user && user.role === "SuperAdmin") {
      setProfileLink("/super-admin-profile");
      console.log("user",user)
    }
  }, []);
  return (
    <nav className="fixed top-0 left-0 right-0 bg-indigo-600 h-14 flex items-center px-4 z-30">
      <div className="ml-4 text-white font-semibold text-lg">CodeDev CRM</div>
      <div className="ml-auto flex items-center gap-4">
        <div className="">
          {profileLink && (
            <Link to={profileLink} aria-label="View Profile">
              <Users size={20} className="text-white" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
