import React, { useState, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  
    try {
      const isAdmin = state === "Admin";
      const endpoint = isAdmin ? "/api/admin/login" : "/api/doctor/login";
      const tokenKey = isAdmin ? "aToken" : "dToken";
      const setToken = isAdmin ? setAToken : setDToken;
  
      console.log("Login attempt:", { endpoint, formData }); // Debug
      
      const { data } = await axios.post(`${backendUrl}${endpoint}`, formData);
      
      console.log("Full login response:", data); // Debug - see complete response
      console.log("Response properties:", Object.keys(data)); // Debug - see what properties exist
  
      if (data.success) {
        // Check different possible token property names
        const token = data.token || data.accessToken || data.authToken || data.jwt || data.bearer;
        
        console.log("Checking for token in response:");
        console.log("data.token:", data.token);
        console.log("data.accessToken:", data.accessToken);
        console.log("data.authToken:", data.authToken);
        console.log("data.jwt:", data.jwt);
        console.log("data.bearer:", data.bearer);
        console.log("Final token value:", token);
        
        if (!token || token === "undefined" || token === "null") {
          console.error("No valid token received from server");
          toast.error("Login failed: No authentication token received");
          return;
        }
        
        console.log("Valid token received:", token.substring(0, 50) + "..."); // Debug
        console.log("Storing token with key:", tokenKey); // Debug
        
        // Store token
        localStorage.setItem(tokenKey, token);
        setToken(token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem(tokenKey);
        console.log("Token verification:", {
          stored: storedToken ? storedToken.substring(0, 20) + "..." : "NONE",
          matches: storedToken === token
        });
        
        // Set axios defaults immediately
        if (isAdmin) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log("Axios authorization header set successfully");
        }
        
        toast.success("Login successful!");
        
        // Optional: Clear form data
        setFormData({ email: "", password: "" });
        
      } else {
        console.error("Login failed:", data.message || "Unknown error");
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Something went wrong. Please try again.";
      
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5e5e5e] text-sm shadow-lg">
        <p className="text-2xl m-auto font-semibold">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            name="email"
            onChange={handleInputChange}

            className="border border-[#DADADA] rounded mt-1 p-2 w-full"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            name="password"
            onChange={handleInputChange}
            value={formData.password}
            className="border border-[#DADADA] rounded mt-1 p-2 w-full"
            type="password"
            required
          />
        </div>
        <button
          className="bg-primary text-white w-full text-base py-2 rounded-md"
          type="submit"
        >
          Login
        </button>


        

      
      </div>
    </form>
  );
};

export default Login;