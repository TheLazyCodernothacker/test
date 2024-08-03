//  useEffect(() => {
//     const socket = io({ transports: ["websocket"] });

//     socket.emit("message", "nig");

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Logo from "./Logo_square.png"
import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Home from './Home';
import Login from "./Login"

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      </>
  )
)

function App({routes}) {

  return (
    <>
      <RouterProvider router={router}/>
    </>
  );
}

export default App;