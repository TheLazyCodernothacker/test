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
const Dashboard = lazy(() => import("./Dashboard"));
const Profile = lazy(() => import("./Profile"));
import { ThemeProvider } from "./components/ThemeProvider";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={<Loader />}>
            <Profile />
          </Suspense>
        }
      />
    </>
  )
);
// @ts-ignore
function App({ routes }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Navbar />
      <RouterProvider router={router} />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
