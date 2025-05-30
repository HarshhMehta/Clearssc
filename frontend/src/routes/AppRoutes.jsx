import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/Home.jsx";
import Doctors from "../pages/Doctors.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import Login from "../pages/Login.jsx";
import MyAppointments from "../pages/MyAppointments.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import Appointment from "../pages/Appointment.jsx";
import Layout from "./Layout.jsx";
import PaymentSuccess from '../pages/PaymentSuccess.jsx';
import FAQ from "../Components/faq.jsx";



const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Wrap everything in Layout, so NavBar appears everywhere
    children: [
      { index: true, element: <Home /> }, // Set Home as the index route
      {
        path: "Services",
        element: <Doctors />,
      },
      {
        path: "doctors/:speciality",
        element: <Doctors />,
      },
      
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "my-appointments",
        element: <MyAppointments />,
      },
      {
        path: "my-profile",
        element: <MyProfile />,
      },
      {
        path: "appointment/:docId",
        element: <Appointment />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />

    </>
  );
};

export default AppRoutes;
