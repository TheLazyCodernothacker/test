import { useEffect, useState, useRef } from "react";
import useSession from "./hooks/useSession";
import useSocket from "./hooks/useSocket";
import ReactMarkdown from "react-markdown";
import { text } from "stream/consumers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Dashboard() {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const textAreaRef = useRef(null);
  const chatRef = useRef(null);
  const addUserRef = useRef(null);
  const gcName = useRef(null);
  const socket = useSocket(import.meta.env.BASE_URL);

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
        setUser(res);
        console.log(res);
        localStorage.setItem("id", res.id);

        const resGroupChats = await fetch("/api/getGroupChats");
        const data = await resGroupChats.json();

        console.log(data);
        setGroupChats(data.groupChats);
        setCurrentChat((chat) => data.groupChats[0]);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && currentChat) {
        e.preventDefault();
        sendMessage(currentChat._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentChat]);

  useEffect(() => {
    console.log(currentChat);
  }, [currentChat]);

  function sendMessage(id) {
    const message = textAreaRef.current.value;
    if (!message) return;
    if (socket) {
      socket.emit("message", {
        message,
        id: localStorage.getItem("id"),
        chatId: id,
        handle: user.handle,
      });
      textAreaRef.current.value = "";
    }

    setGroupChats((prevGroupChats) => {
      const groupChatsCopy = [...prevGroupChats];
      const chat = groupChatsCopy.find((chat) => chat._id === id);
      if (chat) {
        chat.messages.push({
          message,
          name: user.user,
          handle: user.handle,
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
      socket.emit("join", localStorage.getItem("id"));
      console.log("socket connected");
      socket.on("message", (data) => {
        console.log(data);
        const { chatId, message, name, handle } = data;

        setGroupChats((prevGroupChats) => {
          const groupChatsCopy = [...prevGroupChats];
          const chat = groupChatsCopy.find((chat) => chat._id === chatId);
          if (chat) {
            chat.messages.push({
              message,
              name,
              handle: handle,
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
        <div className="w-1/4  p-6 flex flex-col  overflow-y-scroll">
          <Card className="mb-2">
            <CardHeader>
              <CardTitle>Create Group Chat</CardTitle>
              <CardDescription>
                Create a chat with a unique name and add users later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="Chat name" ref={gcName} />
            </CardContent>
            <CardFooter>
              <Button size={"default"} onClick={addGroupChat}>
                Add
              </Button>
            </CardFooter>
          </Card>

          {loading ? (
            <h1 className="text-white p-2">Loading...</h1>
          ) : !groupChats.length ? (
            <h1 className="text-white p-2">No Group Chats</h1>
          ) : (
            groupChats.map((chat, i) => (
              <div
                className={
                  "flex justify-between items-center p-2 px-4 bg-secondary  hover:bg-secondary/40 rounded-lg my-2  cursor-pointer transition-all duration-200 " +
                  (currentChat?._id === chat._id ? "bg-secondary/40" : "")
                }
                key={i}
                onClick={() => setCurrentChat((pastChat) => chat)}
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
              <div className=" text-white flex items-center p-4 ">
                <h1>{currentChat.name}</h1>

                <Dialog>
                  <DialogTrigger className="ml-auto">
                    <Button size={"sm"} className="text-lg">
                      Add Users
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <h1 className="text-xl">Add User(s) by handle</h1>
                    <Input
                      type="text"
                      placeholder="coolguy,nerd1234,etc."
                      ref={addUserRef}
                    />
                    <DialogFooter>
                      <DialogClose>
                        <Button onClick={addUser}>Add</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                        message.handle === user.handle
                          ? "bg-gray-400 text-black block ml-auto"
                          : "bg-gray-200 text-black block mr-auto"
                      } px-4 rounded-lg py-2`}
                    >
                      <h3
                        className={`text-sm mb-0 ${
                          message.handle === user.handle
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
              <div className="relative mb-2" style={{ height: "10%" }}>
                <Textarea
                  placeholder="Send your wisdom"
                  ref={textAreaRef}
                  className="overflow-x-scroll h-full border-box min-h-0"
                />
                <Button
                  className="absolute right-0 z-20 top-0 h-full aspect-square"
                  onClick={() => {
                    sendMessage(currentChat._id);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </Button>
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
