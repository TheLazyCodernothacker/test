//  useEffect(() => {
//     const socket = io({ transports: ["websocket"] });

//     socket.emit("message", "nig");

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

import { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { Sign } from "crypto";
const Home = lazy(() => import("./Home"));
const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));
const Dashboard = lazy(() => import("./Dashboard"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspense fallback={<Loader />}>
            <Signup />
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        }
      />
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
