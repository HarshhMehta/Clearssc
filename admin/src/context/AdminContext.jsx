import { useState, createContext, useEffect } from "react";
import React from 'react'
import { toast } from "react-toastify";
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Initialize token from localStorage on mount - run only once
  useEffect(() => {
    const initializeToken = () => {
      try {
        const storedToken = localStorage.getItem("aToken");
        console.log("Initializing token from localStorage:", storedToken ? "Token found" : "No token found");
        
        if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
          setAToken(storedToken);
          console.log("Token set from localStorage:", storedToken.substring(0, 20) + "...");
        } else {
          console.log("No valid token found in localStorage");
          // Clear any invalid tokens
          localStorage.removeItem("aToken");
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeToken();
  }, []); // Empty dependency array - run only once

  // Set axios defaults when token changes
  useEffect(() => {
    if (aToken && aToken !== "undefined" && aToken !== "null") {
      axios.defaults.headers.common['Authorization'] = `Bearer ${aToken}`;

    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log("Axios authorization header cleared");
    }
  }, [aToken]);

  // Update localStorage when aToken changes (but not during initialization)
  useEffect(() => {
    if (isInitialized) {
      if (aToken && aToken !== "undefined" && aToken !== "null") {
        localStorage.setItem("aToken", aToken);
        console.log("Token saved to localStorage");
      } else {
        localStorage.removeItem("aToken");
        console.log("Token removed from localStorage");
      }
    }
  }, [aToken, isInitialized]);

  // Enhanced setAToken function with validation
  const setATokenWithValidation = (token) => {
    console.log("Setting new token:", token ? "Token provided" : "No token");
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      setAToken(token.trim());
    } else {
      console.warn("Invalid token provided, clearing token");
      setAToken("");
    }
  };

  // Helper function to get current valid token
  const getCurrentToken = () => {
    let currentToken = aToken;
    
    // Fallback to localStorage if state token is empty
    if (!currentToken || currentToken === "undefined" || currentToken === "null") {
      currentToken = localStorage.getItem("aToken");
    }
    
    // Validate token
    if (!currentToken || currentToken === "undefined" || currentToken === "null" || currentToken.trim() === "") {
      console.warn("No valid token available");
      return null;
    }
    
    return currentToken.trim();
  };

  // Helper function to fetch data with explicit headers
  const fetchData = async (url, method = "GET", data = null) => {
    setLoading(true);
    
    const currentToken = getCurrentToken();
    console.log("Making API call to:", url);
    console.log("Method:", method);
    console.log("With token:", currentToken ? currentToken.substring(0, 20) + "..." : "NO TOKEN");
    console.log("Request data:", data);
    
    if (!currentToken) {
      setLoading(false);
      toast.error("Authentication required. Please login again.");
      return null;
    }
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log("Request config:", config);
      
      const response = method === "GET" 
        ? await axios.get(url, config)
        : await axios.post(url, data, config);
      
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("=== API ERROR DETAILS ===");
      console.error("URL:", url);
      console.error("Method:", method);
      console.error("Request data:", data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.data || error.message);
      console.error("Full error:", error);
      console.error("========================");
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Authentication failed, clearing token");
        setATokenWithValidation("");
        toast.error("Session expired. Please login again.");
      } else if (error.response?.status === 400) {
        console.log("Bad Request - checking request format");
        toast.error("Bad request. Please check your data format.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Something went wrong");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all doctors - ENHANCED WITH BETTER ERROR HANDLING
  const getAllDoctors = async () => {
    try {
      console.log("=== FETCHING ALL DOCTORS ===");
      console.log("Backend URL:", backendUrl);
      console.log("Full endpoint:", backendUrl + "/api/admin/all-doctors");
      
      // Try GET method first, then POST if it fails
      let data;
      try {
        console.log("Trying GET method first...");
        data = await fetchData(backendUrl + "/api/admin/all-doctors", "GET");
      } catch (getError) {
        console.log("GET failed, trying POST method...");
        // If GET fails, try POST with empty body
        data = await fetchData(backendUrl + "/api/admin/all-doctors", "POST", {});
      }
  
      console.log("Full response from /all-doctors:", data);
  
      if (data && data.success) {
        setDoctors(data.doctors || []);
        console.log("Doctors loaded successfully:", data.doctors?.length || 0);
      } else if (data) {
        console.error("API returned success: false", data);
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Error fetching doctors");
    }
  };

  useEffect(() => {
    console.log("Doctors state updated:", doctors);
  }, [doctors]);

  // Fetch all appointments
  const getAllAppointments = async () => {
    try {
      const data = await fetchData(backendUrl + "/api/admin/appointments");
      if (data && data.success) {
        setAppointments(data.appointments);
        console.log("Appointments loaded successfully:", data.appointments.length);
      } else if (data) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  // Fetch dashboard data
  const getDashboardData = async () => {
    try {
      const data = await fetchData(backendUrl + "/api/admin/dashboard");
      if (data && data.success) {
        setDashboardData(data.dashData);
        console.log("Dashboard data loaded successfully");
      } else if (data) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  // Cancel appointment
  const cancelAppointments = async (appointmentId) => {
    try {
      const data = await fetchData(
        backendUrl + "/api/admin/appointment-cancel",
        "POST",
        { appointmentId }
      );
      if (data && data.success) {
        toast.success(data.message);
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
      } else if (data) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  // Change doctor's availability
  const changeAvailability = async (docId) => {
    try {
      const data = await fetchData(
        backendUrl + "/api/admin/change-availability",
        "POST",
        { docId }
      );
      if (data && data.success) {
        toast.success(data.message);
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === docId
              ? { ...doctor, available: !doctor.available }
              : doctor
          )
        );
      } else if (data) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to change availability:", error);
    }
  };

  // Delete doctor
  const deleteDoctor = async (docId) => {
    try {
      console.log("Attempting to delete service with ID:", docId);
      
      const data = await fetchData(
        backendUrl + "/api/admin/delete-doctor",
        "POST",
        { docId }
      );
      
      if (data && data.success) {
        toast.success(data.message || "Doctor deleted successfully");
        // Remove the deleted doctor from the state
        setDoctors((prevDoctors) =>
          prevDoctors.filter((doctor) => doctor._id !== docId)
        );
        console.log("Doctor deleted successfully");
      } else if (data) {
        toast.error(data.message || "Failed to service doctor");
      }
    } catch (error) {
      console.error("Failed to service doctor:", error);
      toast.error("Error deleting doctor");
    }
  };

  // Fetch data when token is available and initialized
  useEffect(() => {
    if (isInitialized && aToken && aToken !== "undefined" && aToken !== "null") {
      console.log("Token available, fetching initial data...");
      getAllDoctors();
      getAllAppointments();
      getDashboardData();
    } else if (isInitialized) {
      console.log("No token available, skipping data fetch");
    }
  }, [aToken, isInitialized]);

  const debugToken = () => {
    const token = getCurrentToken();
    if (token) {
      try {
        // Split the JWT and decode the payload (without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("=== TOKEN PAYLOAD DEBUG ===");
        console.log("Full payload:", payload);

        console.log("Role in token:", payload.role);
        console.log("Issued at:", new Date(payload.iat * 1000));
        console.log("Expires at:", payload.exp ? new Date(payload.exp * 1000) : "No expiration");
        console.log("=========================");
        return payload;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.log("No token to debug");
    }
  };

  // Debug: Log token state changes
  useEffect(() => {
    console.log("Token state changed:", {
      aToken: aToken ? aToken.substring(0, 20) + "..." : "NO TOKEN",
      isInitialized,
      localStorage: localStorage.getItem("aToken") ? "TOKEN_EXISTS" : "NO_TOKEN"
    });
  }, [aToken, isInitialized]);

  // Add a manual test function for debugging
  const testDoctorsEndpoint = async () => {
    console.log("=== MANUAL ENDPOINT TEST ===");
    const token = getCurrentToken();
    if (!token) {
      console.log("No token available for test");
      return;
    }

    // Test with curl-like approach
    try {
      const response = await axios({
        method: 'POST',
        url: backendUrl + "/api/admin/all-doctors",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {} // Empty object for POST
      });
      console.log("Manual test successful:", response.data);
    } catch (error) {
      console.log("Manual test failed:", error.response?.data || error.message);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken: setATokenWithValidation, // Use enhanced setter
        backendUrl,
        doctors,
        changeAvailability,
        deleteDoctor, // Add delete doctor function
        appointments,
        setAppointments,
        getAllAppointments,
        cancelAppointments,
        dashboardData,
        getDashboardData,
        loading,
        isInitialized,
        getCurrentToken, // Expose for debugging
        debugToken, // Expose for debugging
        testDoctorsEndpoint // Add manual test function
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;