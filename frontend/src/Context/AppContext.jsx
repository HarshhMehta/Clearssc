import { useState, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";


export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || false);
  const [userData, setUserData] = useState(false);

  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    console.log("Sending token: ", token);
    console.log("Backend URL: ", backendUrl);
    
    try {
      const response = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log("Full Response: ", response);
      console.log("Response Data: ", response.data);
      console.log("Response Status: ", response.status);
      
      const { data } = response;
      
      // Check if we got HTML instead of JSON (indicates backend is not responding)
      if (typeof data === 'string' && data.includes('<!doctype html>')) {
        throw new Error('Backend server is not responding correctly');
      }
      
      if (data.success) {
        setUserData(data.userData);
        console.log("User data set successfully: ", data.userData);
      } else {
        console.log("API returned error: ", data.message);
        toast.error(data.message);
        if (data.message === "Not Authorized. Please login again." && response.status === 401) {
          
        }
      }
    } catch (error) {
      console.log("Profile Fetch Error: ", error);
      console.log("Error Response: ", error.response);
      
      if (error.response) {
        console.log("Error Status: ", error.response.status);
        console.log("Error Data: ", error.response.data);
        toast.error(error.response.data?.message || 'Server error');
      } else if (error.request) {
        console.log("No response received: ", error.request);
        toast.error('Cannot connect to server. Please check if your backend is running.');
      } else {
        console.log("Request setup error: ", error.message);
        toast.error('An unexpected error occurred');
      }
      
      if (error.response?.status === 401) {
        setToken(false);
        localStorage.removeItem("token");
        setUserData(false);
      }
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    console.log("Token Changed:", token);
    if (token) {
      localStorage.setItem("token", token); // 🟢 ADD THIS LINE
      loadUserProfileData();
      getDoctorsData();
    } else {
      localStorage.removeItem("token");
      setUserData(false);
    }
  }, [token]);
  

  return (
    <AppContext.Provider
      value={{
        doctors,
        getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;