import { useEffect, useState, useRef } from "react";
import useSession from "./hooks/useSession";
import useSocket from "./hooks/useSocket";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState("");
  const chatRef = useRef(null);
  const addUserRef = useRef(null);
  const gcName = useRef(null);
  const socket = useSocket("http://localhost:5000");

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
    if (data.message === "Group chat created") {
      alert("Group Chat Created");
      window.location.reload();
    } else {
      alert(data.message);
    }
  }

  useEffect(() => {
    const fetchSession = async () => {
      const res = await useSession();
      if (res.message === "Session not found") {
        window.location.href = "/login";
      } else {
        setUserName(res.user);

        const resGroupChats = await fetch("/api/getGroupChats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: localStorage.getItem("id") }),
        });
        const data = await resGroupChats.json();
        setGroupChats(data.groupChats);
        setCurrentChat(data.groupChats[0]);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  function sendMessage(id) {
    if (!message) return;

    if (socket) {
      socket.emit("message", {
        message,
        id: localStorage.getItem("id"),
        chatId: id,
      });
    }

    setGroupChats((prevGroupChats) => {
      const groupChatsCopy = [...prevGroupChats];
      const chat = groupChatsCopy.find((chat) => chat._id === id);
      if (chat) {
        chat.messages.push({
          message,
          name: userName,
        });
      }
      return groupChatsCopy;
    });
  }

  function addUser() {
    let users = addUserRef.current.value.split(",");
    socket.emit("addUserToChat", {
      users,
      chatId: currentChat._id,
      id: localStorage.getItem("id"),
    });
    setShowModal(false);
  }

  useEffect(() => {
    if (socket) {
      console.log("socket connected");
      socket.on("message", (data) => {
        const { chatId, message, name } = data;

        setGroupChats((prevGroupChats) => {
          const groupChatsCopy = [...prevGroupChats];
          const chat = groupChatsCopy.find((chat) => chat._id === chatId);
          if (chat) {
            chat.messages.push({
              message,
              name,
            });
          }
          return groupChatsCopy;
        });
      });

      socket.on("usersAdded", (addUser, missedUsers) => {
        if (addUser) {
          setGroupChats((prevGroupChats) => {
            const groupChatsCopy = [...prevGroupChats];
            const chat = groupChatsCopy.find(
              (chat) => chat._id === currentChat._id
            );
            if (chat) {
              if (users.length > currentChat.users.length) {
                alert("Users added successfully");
                chat.users = users;
              }
            }
            return groupChatsCopy;
          });
        }
        if (missedUsers.length) {
          alert(
            `The following users were not found: ${missedUsers.join(", ")}`
          );
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [groupChats, currentChat]);

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
                ref={addUserRef}
              />
              <button
                className="bg-sky-500 text-white px-3 py-1 rounded-lg mt-4"
                onClick={addUser}
              >
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
                className={
                  "flex justify-between items-center p-2 px-4 bg-sky-400 rounded-lg my-2 hover:bg-sky-600 cursor-pointer transition-all duration-200 " +
                  (currentChat?._id === chat._id ? "bg-sky-600" : "")
                }
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
                ref={chatRef}
              >
                {currentChat.messages ? (
                  currentChat.messages.map((message, i) => (
                    <div
                      key={i}
                      style={{ maxWidth: "50%", minWidth: "10rem" }}
                      className={`${
                        message.name === userName
                          ? "bg-sky-500 text-white block ml-auto"
                          : "bg-gray-200 text-black block mr-auto"
                      } px-4 rounded-lg py-2`}
                    >
                      <h3
                        className={`text-sm mb-0 ${
                          message.name === userName
                            ? "text-gray-600"
                            : "text-gray-700"
                        }`}
                        style={{ marginBottom: "-0.25rem" }}
                      >
                        {message.name}
                      </h3>
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
