import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Logo from "./Logo_square.png"

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
      <nav className="bg-sky-600 flex p-4 gap-4 items-center">
        <h1 className="text-white text-xl px-3 py-2">Feather Chat</h1>
        <h1 className="text-white text-xl ml-auto bg-sky-700 px-4 py-2 rounded">Login</h1>
        
      </nav>
      <main className="px-8 flex items-center flex-col flex-wrap
      ">
        <div className="w-2/3 flex items-center flex-wrap my-6 justify-center">
        <img src={Logo} className="w-48">
        </img>
        <h1 className="text-8xl">Feather Chat</h1>
        </div>
        <h2 className="text-6xl w-2/3 text-center">Welcome to Feather Chat</h2>
        <p className="mt-4 text-3xl w-2/3 text-center">Feather Chat is a neat chatting app with a simple signup to get you chatting with your friends in no time!</p>
        <button className="px-4 py-2 rounded bg-sky-600 text-white text-2xl mt-6">Get started</button>
      </main>
      <footer className="p-4 text-xl text-white text-center mt-16 bg-sky-600">
        2024 &copy Feather Chat
      </footer>
    </>
  );
}

export default App;
