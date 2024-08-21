import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Logo from "./Logo_square.png";
import { Button } from "@/components/ui/button";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const socket = io({ transports: ["websocket"] });

    socket.emit("message", "nig");

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <main
        className="px-8 
      "
        style={{ minHeight: "80vh" }}
      >
        <div className=" md:flex  md:flex-wrap my-6 ">
          <div className="min-h-96 flex items-center p-6 md:w-2/3">
            <div style={{ maxWidth: "500px" }}>
              <h1 className="text-6xl">Feather Chat</h1>
              <p className="mt-4 text-2xl ">
                A neat chatting app with a simple signup to get you chatting
                with your friends in no time!
              </p>
              <a href="/login">
                <Button size="lg" className="mt-6" variant={"secondary"}>
                  Get Started!
                </Button>
              </a>
            </div>
          </div>
          <div className="flex justify-center items-center md:w-1/3">
            <img className="w-2/3" src={Logo}></img>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
