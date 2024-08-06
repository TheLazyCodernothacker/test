import { useState, useEffect } from "react";
import useSession from "../hooks/useSession";
import "../App.css";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const session = useSession().then((res) => {
      if (res) {
        setLoggedIn(true);
      }
    });
  }, []);
  return (
    <nav className="bg-sky-600 flex p-4 gap-4 items-center">
      <h1 className="text-white text-xl px-3 py-2">Feather Chat</h1>
      {loggedIn ? (
        <a
          onClick={() => {
            localStorage.removeItem("id");
            window.location.href = "/login";
          }}
          className="ml-auto text-white text-xl  bg-sky-700 px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </a>
      ) : (
        <>
          <a
            href="/login"
            className="ml-auto text-white text-xl  bg-sky-700 px-4 py-2 rounded"
          >
            Login
          </a>
          <a
            href="/signup"
            className=" text-white text-xl  bg-sky-800 px-4 py-2 rounded"
          >
            Signup
          </a>
        </>
      )}
    </nav>
  );
}
