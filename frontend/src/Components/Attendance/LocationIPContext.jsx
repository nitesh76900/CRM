import React, { createContext, useState, useEffect, useContext } from "react";

export const LocationIPContext = createContext({
  currentIP: null,
  currentLocation: null,
  isReady: false,
  loading: false,
  error: null,
  fetchLocationAndIP: () => {},
});

export const LocationIPProvider = ({ children }) => {
  const [currentIP, setCurrentIP] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isReady, setIIsReady] = useState(false);

  const setLocationAndIP = ({ip, location}) => {
    if (ip) setCurrentIP(ip);
    if (location) setCurrentLocation(location);
  };
  
  return (
    <LocationIPContext.Provider
      value={{
        currentIP,
        currentLocation,
        isReady,
        setIIsReady,
        setLocationAndIP,
      }}
    >
      {children}
    </LocationIPContext.Provider>
  );
};

// Custom hook for using the context
export const useLocationIP = () => useContext(LocationIPContext);