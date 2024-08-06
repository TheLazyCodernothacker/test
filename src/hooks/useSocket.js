// useSocket.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";

const useSocket = (url) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(url);
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  return socketRef.current;
};

export default useSocket;
