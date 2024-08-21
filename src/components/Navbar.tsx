import { useState, useEffect } from "react";
import useSession from "../hooks/useSession";
import "../App.css";
import { Button } from "@/components/ui/button";

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
    <nav className=" flex p-4 py-3 gap-4 items-center bg-secondary/50">
      <h1 className="text-white text-xl px-3 py-2">Feather Chat</h1>
      {loggedIn ? (
        <div className="ml-auto flex gap-4">
          <a href="/profile">
            <img src={image} className="h-10 rounded-full" />
          </a>
          <Button
            onClick={() => {
              window.location = "/dashboard";
            }}
            variant={"outline"}
            size={"default"}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("id");
              window.location.href = "/logout";
            }}
            variant={"default"}
            size={"default"}
          >
            Logout
          </Button>
        </div>
      ) : (
        <>
          <Button
            onClick={() => (window.location = "/login")}
            className="ml-auto"
            variant={"outline"}
            size={"default"}
          >
            Login
          </Button>
          <Button onClick={() => (window.location = "/login")} size={"default"}>
            Signup
          </Button>
        </>
      )}
    </nav>
  );
}
