import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Logo from "./Logo_square.png";

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
        className="px-8 flex items-center flex-col flex-wrap
      "
      >
        <div className="w-2/3 flex items-center flex-wrap my-6 justify-center">
          <img src={Logo} className="w-48"></img>
          <h1 className="text-8xl">Feather Chat</h1>
        </div>
        <p className="mt-4 text-3xl w-2/3 text-center">
          Feather Chat is a neat chatting app with a simple signup to get you
          chatting with your friends in no time!
        </p>
        <a href="/signup">
          <button className="px-4 py-2 rounded bg-sky-600 text-white text-2xl mb-16 mt-6">
            Get started
          </button>
        </a>
      </main>
    </>
  );
}

export default App;
