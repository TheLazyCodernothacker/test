import { useState, useEffect } from "react";
import useSession from "../hooks/useSession";
import "../App.css";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [image, setImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
  );
  useEffect(() => {
    const session = useSession().then((res) => {
      if (res.message !== "Session not found") {
        setLoggedIn(true);
        if (res.image) {
          setImage(res.image);
        }
      } else {
        setLoggedIn(false);
      }
    });
  }, []);
  return (
    <nav className="bg-sky-600 flex p-4 gap-4 items-center">
      <h1 className="text-white text-xl px-3 py-2">Feather Chat</h1>
      {loggedIn ? (
        <div className="ml-auto flex gap-4">
          <a href="/profile">
            <img src={image} className="h-10 rounded-full" />
          </a>
          <a
            href="dashboard"
            className=" text-white text-xl  bg-sky-700 px-4 py-2 rounded cursor-pointer"
          >
            Dashboard
          </a>
          <a
            onClick={() => {
              localStorage.removeItem("id");
              window.location.href = "/logout";
            }}
            className=" text-white text-xl  bg-sky-800 px-4 py-2 rounded cursor-pointer"
          >
            Logout
          </a>
        </div>
      ) : (
        <>
          <a
            href="/login"
            className="ml-auto text-white text-xl  bg-sky-700 px-4 py-2 rounded"
          >
            Login
          </a>
          <a
            href="/login"
            className=" text-white text-xl  bg-sky-800 px-4 py-2 rounded"
          >
            Signup
          </a>
        </>
      )}
    </nav>
  );
}
