import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectUser } from "../store/slices/userSlice";

const ProtectedRoute = ({ children, permissions }) => {
  const [role, setRole] = useState("");
  const [userPermissions, setUserPermissions] = useState(null);
  const isAuth = useSelector((state) => state.user?.isAuthenticated);
  // const userPermissions = useSelector((state) => state.user?.permissions); 
  // 
  const location = useLocation();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user.company) {
      setRole("Employee");
      setUserPermissions(user.role.permissions);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  }, [user]);

  // Redirect to login if user is not authenticated
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no permissions are required, allow access
  if (!permissions) {
    return children;
  }

  // Function to check permissions
  const checkPermissions = () => {
    // Company Admin has access to all pages
    if (role === "CompanyAdmin") {
      return true;
    }

    // For employees, check specific permissions
    if (role === "Employee") {
      if (!userPermissions) return false;

      const path = location.pathname;

      // Define route-permission mapping
      const routePermissionMap = {
        "/lead": userPermissions.leads?.read,
        "/assign-task": userPermissions.tasks?.read,
        "/meetings": userPermissions.meeting?.read,
        "/all-user-todo": userPermissions.todos?.read,
      };

      // If the path is not in the map, allow access
      if (!(path in routePermissionMap)) return true;

      // Return true only if the required permission exists and is true
      return !!routePermissionMap[path];
    }

    // For any other role (like SuperAdmin), you can add specific logic here
    return false;
  };

  // Redirect if user lacks permissions
  if (!checkPermissions()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
