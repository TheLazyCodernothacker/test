import { useEffect, useState, useRef } from "react";
import useSession from "./hooks/useSession";
import { Socket, io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import useSocket from "./hooks/useSocket";

export default function Dashboard() {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const socket = useSocket("http://localhost:5000");
  const gcName = useRef(null);
  async function addGroupChat() {
    let groupChatName = gcName.current.value;
    if (groupChatName.length < 3) {
      alert("Group Chat Name must be at least 3 characters");
      return;
    }
    const res = await fetch("/api/createGroupChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: groupChatName,
        id: localStorage.getItem("id"),
      }),
    });
    const data = await res.json();
    if (data.message == "Group chat created") {
      alert("Group Chat Created");
      window.location.reload();
    } else {
      alert(data.message);
    }
  }
  useEffect(() => {
    const session = useSession().then((res) => {
      if (!res) {
        window.location.href = "/login";
      }
      fetch("/api/getGroupChats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: localStorage.getItem("id") }),
      }).then((res) =>
        res.json().then((data) => {
          console.log(data);
          setGroupChats(data.groupChats);
          setCurrentChat(data.groupChats[0]);
          setLoading(false);
        })
      );
    });
    if (socket) {
      socket.emit("join", localStorage.getItem("id"));
    }
  }, []);
  function sendMessage(id) {
    if (!message) {
      return;
    }
    if (socket) {
      console.log({ message, id: localStorage.getItem("id"), chatId: id });

      socket.emit("message", {
        message,
        id: localStorage.getItem("id"),
        chatId: id,
      });
    }
    let groupChatsCopy = groupChats;
    let chat = groupChatsCopy.find((chat) => chat.id == id);
    chat.messages.push({
      message,
      id: localStorage.getItem("id"),
    });
    setGroupChats((groupChats) => [...groupChatsCopy]);
    console.log("asdf");
  }
  return (
    <>
      <div className="flex relative" style={{ height: "80vh" }}>
        {showModal && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg relative">
              <h1 className="text-xl">Add User(s)</h1>
              <input
                type="text"
                placeholder="coolguy,nerd1234,etc."
                className="p-1 mt-4 rounded-lg w-full bg-gray-200 text-black  text-md px-3"
              />
              <button className="bg-sky-500 text-white px-3 py-1 rounded-lg mt-4">
                Add
              </button>
              <button
                className="bg-gray-200 px-3 py-1 rounded-lg mt-4 ml-2"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="w-1/4 bg-sky-500 p-6 flex flex-col  overflow-y-scroll">
          <div className="rounded p-4 bg-sky-600 mb-6">
            <h1 className="text-white mb-4 text-xl">Create Group Chat</h1>
            <input
              type="text"
              placeholder="Group Chat Name"
              ref={gcName}
              className="p-2 rounded-lg w-full bg-sky-500 text-white placeholder:text-white text-md px-4"
            />
            <button
              className="bg-sky-500 text-white px-2 py-1 rounded-lg mt-2"
              onClick={addGroupChat}
            >
              Create
            </button>
          </div>
          {loading ? (
            <h1 className="text-white p-2">Loading...</h1>
          ) : !groupChats.length ? (
            <h1 className="text-white p-2">No Group Chats</h1>
          ) : (
            groupChats.map((chat, i) => (
              <div
                className="flex justify-between items-center p-2 px-4 bg-sky-400 rounded-lg my-2 hover:bg-sky-600 cursor-pointer transition-all duration-200"
                key={i}
                onClick={() => setCurrentChat(chat)}
              >
                <h1 className="text-white">{chat?.name}</h1>
              </div>
            ))
          )}
        </div>
        <div className="w-3/4 overflow-h-scroll">
          {loading ? (
            <h1>Loading...</h1>
          ) : currentChat ? (
            <div className="flex flex-col h-full">
              <div
                style={{ height: "12%" }}
                className="bg-sky-500 text-white flex items-center p-4"
              >
                {currentChat.name}
                <button
                  className="ml-auto py-1 px-2 bg-sky-600"
                  onClick={() => setShowModal(true)}
                >
                  Add User
                </button>
              </div>
              <div
                style={{ height: "80%" }}
                className="p-4 overflow-y-scroll flex flex-col gap-4"
              >
                {currentChat.messages ? (
                  currentChat.messages.map((message, i) => (
                    <div
                      key={i}
                      className={`${
                        message.id == localStorage.getItem("id")
                          ? "bg-sky-500 text-white"
                          : "bg-gray-200 text-black"
                      } p-4 rounded-lg`}
                    >
                      <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                  ))
                ) : (
                  <h1>No messages</h1>
                )}
              </div>
              <div className="relative" style={{ height: "10%" }}>
                <textarea
                  className="p-2 w-full  bg-gray-200 text-md px-4 h-full"
                  placeholder="Send your wisdom"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="absolute right-0 z-20 top-0 h-full bg-sky-500 aspect-square"
                  onClick={() => {
                    sendMessage(currentChat._id);
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <h1 className="p-4">You are part of no group chats</h1>
          )}
        </div>
      </div>
    </>
  );
}
