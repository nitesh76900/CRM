import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  MapPin,
  Wifi,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import attendanceService from "../../services/attendanceServices";
import { useNavigate } from "react-router";
import { useLocationIP } from "./LocationIPContext";
import { ToastContainer } from "react-toastify";

const AttendanceChecker = ({ allowDropdownOpen = false }) => {
  const [attendanceSettings, setAttendanceSettings] = useState(null);
  const [currentIP, setCurrentIP] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [ipMatched, setIPMatched] = useState(false);
  const [locationMatched, setLocationMatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "Checking attendance requirements..."
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [distanceL1ToL2, setDistanceL1ToL2] = useState(0);
  const navigate = useNavigate();
  const { setLocationAndIP, setIIsReady } = useLocationIP();

  // Function to get current IP address
  const getCurrentIP = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      setStatusMessage("Network IP access is required but not available");
      return null;
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: long } = position.coords;
          resolve({ lat, long });
        },
        (error) => {
          console.error("Geolocation error: ", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("User denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(
                new Error("An unknown error occurred while getting location.")
              );
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options for better accuracy
      );
    });
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Check if location is within acceptable range (500 meters)
  const isLocationMatched = (currentLoc, requiredLoc) => {
    if (!currentLoc || !requiredLoc) return false;

    const distance = calculateDistance(
      currentLoc.lat,
      currentLoc.long,
      requiredLoc.lat,
      requiredLoc.long
    );

    setDistanceL1ToL2(distance);

    // Consider matched if within 0.5 km
    return distance <= 0.5;
  };

  // Define the checkAttendance function
  const checkAttendance = async () => {
    try {
      setLoading(true);

      // Fetch required settings
      const settings = await attendanceService.getAttendanceCheckBy();
      setAttendanceSettings(settings.attendanceCheckBy);

      const locationEnabled = settings?.attendanceCheckBy?.location?.enable;
      const networkIpEnabled = settings?.attendanceCheckBy?.networkIp?.enable;

      // If neither is enabled, stop checking and return early
      if (!locationEnabled && !networkIpEnabled) {
        setLoading(false);
        return;
      }

      // Get current IP if networkIp is enabled
      let ip = null;
      if (networkIpEnabled) {
        ip = await getCurrentIP();
        setCurrentIP(ip);
        setLocationAndIP({ ip });
        // Check if IP matches
        const ipMatch = ip === settings?.attendanceCheckBy?.networkIp?.value;
        setIPMatched(ipMatch);
      } else {
        // If IP check is not enabled, consider it "matched" for overall status
        setIPMatched(true);
      }

      // Get current location if location is enabled
      let location = null;
      if (locationEnabled) {
        try {
          location = await getCurrentLocation();
          setCurrentLocation(location);
          setLocationAndIP({ location });
          // Check if location matches (within range)
          const locMatch = isLocationMatched(
            location,
            settings?.attendanceCheckBy?.location?.value
          );
          setLocationMatched(locMatch);
        } catch (err) {
          setError(err.message);
          setLocationMatched(false);
        }
      } else {
        // If location check is not enabled, consider it "matched" for overall status
        setLocationMatched(true);
      }

      // Set status message based on enabled checks
      if (!locationEnabled && networkIpEnabled) {
        // Only network IP check is enabled
        setStatusMessage(
          ipMatched
            ? "Network IP requirement met!"
            : "Network IP requirement not met"
        );
      } else if (locationEnabled && !networkIpEnabled) {
        // Only location check is enabled
        setStatusMessage(
          locationMatched
            ? "Location requirement met!"
            : "Location requirement not met"
        );
      } else if (locationEnabled && networkIpEnabled) {
        // Both checks are enabled
        if (ipMatched && locationMatched) {
          setStatusMessage("All attendance requirements met!");
        } else {
          setStatusMessage("Some attendance requirements not met");
        }
      }
    } catch (err) {
      setError(err.message || "Failed to check attendance requirements");
      setStatusMessage("Error checking attendance requirements");
    } finally {
      setLoading(false);
    }
  };

  // Now use the checkAttendance function in useEffect
  useEffect(() => {
    // Initial fetch
    checkAttendance();

    // Set up periodic refresh every 2 minutes
    const intervalId = setInterval(() => {
      checkAttendance();
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleExpand = () => {
    if (allowDropdownOpen) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleGoToSetting = () => {
    navigate("/attendance-settings");
  };

  // If neither location nor network IP is enabled, return empty fragment
  if (
    !loading &&
    !attendanceSettings?.location?.enable &&
    !attendanceSettings?.networkIp?.enable
  ) {
    return <></>;
  }

  if (loading) {
    return (
      <div className="flex justify-between p-4 bg-gray-50 rounded-lg shadow animate-pulse my-4">
        <div className="h-5 w-48 bg-gray-300 rounded mb-2"></div>
        <div className="h-5 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const locationEnabled = attendanceSettings?.location?.enable;
  const networkIpEnabled = attendanceSettings?.networkIp?.enable;

  if (ipMatched && locationMatched) {
    setIIsReady(true);
  }

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md overflow-hidden my-4">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      {/* Collapsed Header - Always Visible */}
      <div
        className={`p-4 flex justify-between items-center ${
          allowDropdownOpen ? "cursor-pointer hover:bg-gray-50" : ""
        }`}
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-gray-800 mr-3">
            Attendance Status
          </h2>
          {error ? (
            <span className="px-2 py-1 rounded-full text-white bg-red-500 text-xs">
              {error}
            </span>
          ) : ipMatched && locationMatched ? (
            <span className="px-2 py-1 rounded-full text-white bg-green-500 text-xs">
              Ready
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-white bg-yellow-500 text-xs">
              Not Ready
            </span>
          )}
        </div>

        <div className="flex items-center">
          {/* Status Indicators for Collapsed View - Only show enabled features */}
          <div className="flex items-center mr-4">
            {networkIpEnabled && (
              <div
                className={`mr-3 flex items-center ${
                  ipMatched ? "text-green-600" : "text-red-600"
                }`}
              >
                <Wifi className="h-4 w-4 mr-1" />
                {ipMatched ? (
                  <span title="IP Matched">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                ) : (
                  <span title="IP Mismatch">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                )}
              </div>
            )}

            {locationEnabled && (
              <div
                className={`flex items-center ${
                  locationMatched ? "text-green-600" : "text-red-600"
                }`}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {locationMatched ? (
                  <span title="Location Matched">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                ) : (
                  <span title="Location Mismatch">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expand/Collapse Icon - Only show if dropdown is allowed */}
          {allowDropdownOpen &&
            (isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ))}
        </div>
      </div>

      {/* Expanded Content - Only show if expanded and dropdown is allowed */}
      {isExpanded && allowDropdownOpen && (
        <div className="p-6 border-t border-gray-100">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Admin Note */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-medium text-blue-700 mb-2">Admin Note</h3>
            <p className="text-blue-600 text-sm">
              This page allows you to check if your current{" "}
              {networkIpEnabled && "network IP"}
              {networkIpEnabled && locationEnabled && " and "}
              {locationEnabled && "location"} match the required attendance
              settings. If they don't match, employees won't be able to mark
              attendance.
            </p>
            <p className="text-blue-600 text-sm mt-2">
              Current values can be updated in the Attendance Settings page if
              needed.
            </p>
            {(!ipMatched || !locationMatched) && (
              <div className="mt-3 flex items-center">
                <p
                  onClick={handleGoToSetting}
                  className="inline-flex items-center text-blue-700 font-medium text-sm hover:underline cursor-pointer"
                >
                  Go to Attendance Settings
                  <ArrowRight className="h-4 w-4 ml-1" />
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* IP Address Check - Only show if enabled */}
            {networkIpEnabled && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Wifi className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-medium text-gray-800">
                    Network IP Check
                  </h3>
                </div>

                <div className="ml-7 space-y-2">
                  {currentIP ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Your IP:{" "}
                        <span className="font-medium">{currentIP}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Required IP:{" "}
                        <span className="font-medium">
                          {attendanceSettings?.networkIp?.value}
                        </span>
                      </p>
                      <div
                        className={`flex items-center mt-2 ${
                          ipMatched ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {ipMatched ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1" />
                        )}
                        <p className="text-sm font-medium">
                          {ipMatched
                            ? "IP matches"
                            : "IP doesn't match required network"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-yellow-600">
                      Unable to retrieve your IP address
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location Check - Only show if enabled */}
            {locationEnabled && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-medium text-gray-800">Location Check</h3>
                </div>

                <div className="ml-7 space-y-2">
                  {currentLocation ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Your Location:{" "}
                        <span className="font-medium">
                          {currentLocation?.lat?.toFixed(6)},{" "}
                          {currentLocation?.long?.toFixed(6)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Required Location:{" "}
                        <span className="font-medium">
                          {attendanceSettings?.location?.value?.lat?.toFixed(6)}
                          ,{" "}
                          {attendanceSettings?.location?.value?.long?.toFixed(
                            6
                          )}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Distance Your Location to Required Location :{" "}
                        <span className="font-medium">
                          {distanceL1ToL2.toFixed(2)} KM
                        </span>
                      </p>
                      <div
                        className={`flex items-center mt-2 ${
                          locationMatched ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {locationMatched ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1" />
                        )}
                        <p className="text-sm font-medium">
                          {locationMatched
                            ? "Location matches (within 100m)"
                            : "Location doesn't match required area"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-yellow-600">
                      Unable to retrieve your location
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Message - Only show relevant messages based on enabled features */}
          <div
            className={`mt-6 p-4 rounded-lg ${
              error
                ? "bg-red-50 text-red-700"
                : ipMatched && locationMatched
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            <p className="font-medium">{statusMessage}</p>
            {!ipMatched && networkIpEnabled && !error && (
              <p className="text-sm mt-1">
                Please connect to the required network or update the network IP
                in Attendance Settings.
              </p>
            )}
            {!locationMatched && locationEnabled && !error && (
              <p className="text-sm mt-1">
                Please ensure you are at the designated workplace location or
                update the required location in Attendance Settings.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceChecker;
