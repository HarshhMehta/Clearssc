import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";

const Login = () => {
  const [login, setLogin] = useState("login");
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Form submit triggered");

    if (localStorage.getItem("token")) {
      toast.error("Please log out before registering or logging in as a new user.");
      return;
    }

    const endpoint = login === "Sign Up" ? "/api/user/register" : "/api/user/login";
    const payload =
      login === "Sign Up"
        ? {
            email: user.email,
            name: user.name,
            phone: user.phone,
            password: user.password,
          }
        : {
            email: user.email,
            password: user.password,
          };

    try {
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (typeof data === "string" && data.includes("<!doctype html>")) {
        toast.error("Backend server is not running. Please start your backend server.");
        return;
      }

      if (data.success) {
        if (login === "Sign Up") {
          setLogin("login");
          toast.success("Registered successfully, please log in");
          setUser({ name: "", email: "", phone: "", password: "" });
        } else {
          setToken(data.token);
          setUser(data.userData);
          toast.success("Login successful");
          setUser({ name: "", email: "", phone: "", password: "" });
          navigate("/");
        }
      } else {
        if (data.message === "User already exists. Please login") {
          setLogin("login");
          toast.error("User already exists, redirecting to login...");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Server error occurred");
      } else if (error.request) {
        toast.error("Cannot connect to server. Please check if your backend is running.");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] bg-white flex items-center">
      <div className="flex flex-col m-auto gap-3 items-start p-8 border min-w-[340px] sm:min-w-96 rounded-xl border-zinc-200 shadow-lg text-sm">
        <p className="text-2xl font-semibold text-gray-600">
          {login === "Sign Up" ? "Create account" : "Log In"}
        </p>
        <p className="text-gray-500">
          Please {login === "Sign Up" ? "sign up" : "log in"} to book appointment
        </p>

        {login === "Sign Up" && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                className="border border-zinc-300 p-2 mt-1 w-full rounded"
                type="text"
                name="name"
                onChange={handleChange}
                value={user.name}
                required
              />
            </div>

            <div className="w-full">
              <p>Phone Number</p>
              <input
                className="border border-zinc-300 p-2 mt-1 w-full rounded"
                type="tel"
                name="phone"
                onChange={handleChange}
                value={user.phone}
                required
              />
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 p-2 mt-1 w-full rounded"
            type="email"
            name="email"
            onChange={handleChange}
            value={user.email}
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 p-2 mt-1 w-full rounded"
            type="password"
            name="password"
            onChange={handleChange}
            value={user.password}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white w-full rounded py-3 mt-3 text-base font-medium"
        >
          {login === "Sign Up" ? "Create account" : "Log In"}
        </button>

        {login === "Sign Up" ? (
          <p className="text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => setLogin("login")}
              className="text-primary text-sm font-medium cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-600">
            Create a new account?{" "}
            <span
              onClick={() => setLogin("Sign Up")}
              className="text-primary text-sm font-medium cursor-pointer underline"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
