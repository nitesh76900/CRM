import React, { useState, useEffect } from "react";
import attendanceService from "../../../services/attendanceServices";
import CustomAlert from "./CustomAlert";

const AttendanceSettingsPage = () => {
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    type: "info", // can be "info", "success", "warning", "error"
  });

  const [manualIP, setManualIP] = useState("");
  const [manualLocation, setManualLocation] = useState({ lat: "", long: "" });
  const [settings, setSettings] = useState({
    attendanceBy: "",
    location: {
      enable: false,
      value: { lat: "", long: "" },
    },
    networkIp: {
      enable: false,
      value: "",
    },
    currentIP: "",
    currentLocation: { lat: "", lng: "" },
    isConnectedToCompanyWifi: false,
    isAtCompanyLocation: false,
    isLoading: true,
    error: null,
  });

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get attendance by setting
        const attendanceByData = await attendanceService.getAttendanceBy();

        // Get attendance check by settings
        const checkByData = await attendanceService.getAttendanceCheckBy();

        setSettings((prev) => ({
          ...prev,
          attendanceBy: attendanceByData.attendanceBy,
          location: checkByData.attendanceCheckBy.location || {
            enable: false,
            value: { lat: "", long: "" },
          },
          networkIp: checkByData.attendanceCheckBy.networkIp || {
            enable: false,
            value: "",
          },
          isLoading: false,
        }));
      } catch (error) {
        setSettings((prev) => ({
          ...prev,
          error: error.message || "Failed to load settings",
          isLoading: false,
        }));
      }
    };

    fetchSettings();
  }, []);

  // Function to get current IP address
  const getCurrentIP = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();

      setSettings((prev) => ({
        ...prev,
        currentIP: data.ip,
        isConnectedToCompanyWifi: data.ip === prev.networkIp.value,
      }));

      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      return null;
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;

            // Calculate distance (simplified version)
            const isNearCompany =
              calculateDistance(
                currentLat,
                currentLng,
                parseFloat(settings.location.value.lat),
                parseFloat(settings.location.value.long)
              ) < 100; // 100 meters threshold

            setSettings((prev) => ({
              ...prev,
              currentLocation: { lat: currentLat, lng: currentLng },
              isAtCompanyLocation: isNearCompany,
            }));

            resolve({ lat: currentLat, long: currentLng });
          },
          (error) => {
            console.error("Error getting location:", error);
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      return Infinity;
    }

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Handle toggle for location
  const handleLocationToggle = async () => {
    try {
      if (!settings.location.enable) {
        setAlertInfo({
          show: true,
          message:
            "This will confirm that you are physically present at the company premises before allowing attendance marking. Administrators are exempt, and their presence is automatically verified.",
          type: "info",
          showCancel: true, // Add flag for cancel button
          onConfirm: async () => {
            try {
              const locationData = await getCurrentLocation();
              await attendanceService.setAttendanceCheckBy({
                location: locationData,
              });
              setSettings((prev) => ({
                ...prev,
                location: {
                  enable: true,
                  value: locationData,
                },
              }));
            } catch (error) {
              setAlertInfo({
                show: true,
                message:
                  "Failed to enable location: " +
                  (error.message || "Unknown error"),
                type: "error",
              });
            }
          },
        });
      } else {
        await attendanceService.deleteAttendanceCheckBy({
          location: false,
        });
        setSettings((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            enable: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error toggling location:", error);
      setAlertInfo({
        show: true,
        message:
          "Failed to update location settings: " +
          (error.message || "Unknown error"),
        type: "error",
      });
    }
  };

  // Updated handleIPToggle
  const handleIPToggle = async () => {
    try {
      if (!settings.networkIp.enable) {
        setAlertInfo({
          show: true,
          message:
            "This will confirm that you are connected to the company WiFi network before allowing attendance marking. Administrators are exempt, and their connection is automatically verified.",
          type: "info",
          showCancel: true, // Add flag for cancel button
          onConfirm: async () => {
            try {
              const ipAddress = await getCurrentIP();
              if (!ipAddress) {
                throw new Error("Failed to retrieve IP address");
              }
              await attendanceService.setAttendanceCheckBy({
                networkIp: ipAddress,
              });
              setSettings((prev) => ({
                ...prev,
                networkIp: {
                  enable: true,
                  value: ipAddress,
                },
                currentIP: ipAddress,
              }));
            } catch (error) {
              setAlertInfo({
                show: true,
                message:
                  "Failed to enable IP: " + (error.message || "Unknown error"),
                type: "error",
              });
            }
          },
        });
      } else {
        await attendanceService.deleteAttendanceCheckBy({
          networkIp: false,
        });
        setSettings((prev) => ({
          ...prev,
          networkIp: {
            ...prev.networkIp,
            enable: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error toggling IP:", error);
      setAlertInfo({
        show: true,
        message:
          "Failed to update IP settings: " + (error.message || "Unknown error"),
        type: "error",
      });
    }
  };

  const handleManualIPChange = (e) => {
    setManualIP(e.target.value);
  };

  const handleManualLocationChange = (e) => {
    const { name, value } = e.target;
    setManualLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualIPSubmit = async () => {
    try {
      await attendanceService.setAttendanceCheckBy({
        networkIp: manualIP,
      });
      setSettings((prev) => ({
        ...prev,
        networkIp: {
          enable: true,
          value: manualIP,
        },
      }));
      setAlertInfo({
        show: true,
        message: "IP address successfully updated",
        type: "success",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        message:
          "Failed to update IP address: " + (error.message || "Unknown error"),
        type: "error",
      });
    }
  };

  const handleManualLocationSubmit = async () => {
    try {
      await attendanceService.setAttendanceCheckBy({
        location: manualLocation,
      });
      setSettings((prev) => ({
        ...prev,
        location: {
          enable: true,
          value: manualLocation,
        },
      }));
      setAlertInfo({
        show: true,
        message: "Location successfully updated",
        type: "success",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        message:
          "Failed to update location: " + (error.message || "Unknown error"),
        type: "error",
      });
    }
  };

  if (settings.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading settings...</div>
      </div>
    );
  }

  if (settings.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded border border-red-200">
          Error: {settings.error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className=" mx-auto rounded-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h1 className="text-xl font-semibold text-white">
            Attendance Settings
          </h1>
          <p className="text-sm text-blue-100">
            Configure location and IP requirements for employee attendance
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                    Verification Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                    Current Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Location Verification Row */}
                <tr className="border-b">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">
                      Location Verification
                    </div>
                    <div className="text-gray-500 text-sm">
                      Verify employees are at company premises
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.location.enable}
                          onChange={handleLocationToggle}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {settings.location.enable ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {settings.location.enable && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          Company location:
                          {settings.location.value.lat &&
                          settings.location.value.long
                            ? ` ${parseFloat(
                                settings.location.value.lat
                              ).toFixed(6)}, ${parseFloat(
                                settings.location.value.long
                              ).toFixed(6)}`
                            : " Not set"}
                        </div>
                        <div className="mt-2 grid gap-2">
                          <input
                            type="text"
                            name="lat"
                            value={manualLocation.lat}
                            onChange={handleManualLocationChange}
                            placeholder="Latitude"
                            className="w-full p-2 text-sm border rounded"
                          />
                          <input
                            type="text"
                            name="long"
                            value={manualLocation.long}
                            onChange={handleManualLocationChange}
                            placeholder="Longitude"
                            className="w-full p-2 text-sm border rounded"
                          />
                          <button
                            onClick={handleManualLocationSubmit}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Update Location
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                {/* IP Verification Row */}
                <tr className="border-b">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">
                      IP Verification
                    </div>
                    <div className="text-gray-500 text-sm">
                      Verify employees are connected to company network
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.networkIp.enable}
                          onChange={handleIPToggle}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {settings.networkIp.enable ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {settings.networkIp.enable && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          Company IP: {settings.networkIp.value || "Not set"}
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={manualIP}
                            onChange={handleManualIPChange}
                            placeholder="Enter new IP address"
                            className="w-full p-2 text-sm border rounded"
                          />
                          <button
                            onClick={handleManualIPSubmit}
                            className="mt-1 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Update IP
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Admin Exemption Row */}
                <tr>
                  <td className="px-4 py-4" colSpan="3">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
                      <div className="font-medium">
                        Note: Company Admins are exempt from verification
                      </div>
                      <p>
                        Company administrators are automatically exempt from
                        location and IP verification requirements.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CustomAlert
        show={alertInfo.show}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
        showCancel={alertInfo.showCancel}
        onConfirm={alertInfo.onConfirm}
      />
    </div>
  );
};

export default AttendanceSettingsPage;
