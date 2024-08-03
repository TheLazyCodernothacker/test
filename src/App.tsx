//  useEffect(() => {
//     const socket = io({ transports: ["websocket"] });

//     socket.emit("message", "nig");

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Logo from "./Logo_square.png";
import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Signup from "./Signup";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </>
  )
);

function App({ routes }) {
  return (
    <>
      <Navbar />
      <RouterProvider router={router} />
      <Footer />
    </>
  );
}

export default App;
