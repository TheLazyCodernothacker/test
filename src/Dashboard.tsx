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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserClientType, UserType, ChatType, SessionType } from "types";

export default function Dashboard() {
  const [groupChats, setGroupChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [user, setUser] = useState<UserClientType | null>(null);
  const [requiredUsers, setRequiredUsers] = useState<{
    [key: string]: UserClientType;
  }>({});
  const textAreaRef = useRef(null);
  const chatRef = useRef(null);
  const addUserRef = useRef(null);
  const gcName = useRef(null);
  // @ts-ignore
  const socket = useSocket(import.meta.env.BASE_URL);

  async function addGroupChat() {
    let groupChatName = gcName?.current?.value;
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
        id: localStorage.getItem("_id"),
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
      const res: SessionType = await useSession();

      if (res.message === "Session not found") {
        window.location.href = "/login";
      } else {
        setUser(res.user || null);
        console.log(res, 232123);
        localStorage.setItem("_id", res?.user?._id || "");
        console.log(res.user);

        const resGroupChats = await fetch("/api/getGroupChats");
        const data: {
          groupChats: ChatType[];
          requiredUsers: {
            [key: string]: UserClientType;
          };
        } = await resGroupChats.json();
        console.log(data);

        setGroupChats(data.groupChats);
        console.log(data.requiredUsers);
        setRequiredUsers(data.requiredUsers);
        setCurrentChat((chat) => data.groupChats[0] || null);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  function sendMessage(id: string) {
    const message = textAreaRef?.current?.value;
    if (!message) return;
    if (socket) {
      socket?.emit("message", {
        message,
        id: localStorage.getItem("_id"),
        chatId: id,
        handle: user?.handle,
      });
      textAreaRef.current.value = "";
    }

    // setGroupChats((prevGroupChats) => {
    //   const groupChatsCopy = [...prevGroupChats];
    //   const chat = groupChatsCopy.find((chat) => chat._id === id);
    //   if (chat && user) {
    //     chat.messages.push({
    //       sender: user._id as string,
    //       content: message,
    //       timestamp: new Date().toISOString(),
    //     });
    //   }
    //   return groupChatsCopy;
    // });
  }

  function addUser() {
    let users = addUserRef?.current?.value.split(",");
    socket?.emit("addUserToChat", {
      users,
      chatId: currentChat?._id,
      id: localStorage.getItem("_id"),
    });
    setShowModal(false);
  }

  useEffect(() => {
    if (socket) {
      socket?.emit("join", localStorage.getItem("_id"));
      console.log("socket connected");
      socket?.on(
        "message",
        (data: { chatId: string; sender: string; message: string }) => {
          console.log(data);
          const { chatId, sender, message } = data;

          setGroupChats((prevGroupChats) => {
            const groupChatsCopy = [...prevGroupChats];
            const chat = groupChatsCopy.find((chat) => chat._id === chatId);
            if (chat) {
              chat.messages.push({
                sender: sender,
                content: message,
                timestamp: new Date().toISOString(),
              });
            }
            return groupChatsCopy;
          });
        }
      );

      socket.on(
        "usersAdded",
        (
          addUser: boolean,
          missedUsers: string[],
          newUsers: {
            role: "User" | "Admin" | "Owner" | "Author";
            _id: string;
          }[],
          requiredUsers: {
            [key: string]: UserClientType;
          },
          chatId: string,
          dupes: string[]
        ) => {
          if (dupes) {
            alert("Found duplicate users: " + dupes.join(", "));
          }
          if (addUser) {
            setGroupChats((prevGroupChats) => {
              const groupChatsCopy = [...prevGroupChats];
              const chat = groupChatsCopy.find((chat) => chat._id === chatId);
              if (chat) {
                chat.users.push(...newUsers);
              }
              alert(
                "Users added: " +
                  newUsers
                    .map((user) => requiredUsers[user._id].username)
                    .join(", ")
              );
              newUsers.forEach((user) => {
                setRequiredUsers((prevUsers) => {
                  return {
                    ...prevUsers,
                    [user._id]: requiredUsers[user._id],
                  };
                });
              });

              return groupChatsCopy;
            });
          }
          if (missedUsers.length) {
            alert(
              `The following users were not found: ${missedUsers.join(", ")}`
            );
          }
        }
      );
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
        <div className="w-3/4 overflow-h-scroll border-l-8 border-secondary/50 p-4">
          {loading ? (
            <h1>Loading...</h1>
          ) : currentChat ? (
            <div className="flex flex-col h-full">
              <div className=" text-white flex items-center px-4  pb-4">
                <h1>{currentChat.name}</h1>
                <Dialog>
                  <DialogTrigger className="ml-auto ">
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      className="text-md mr-2"
                    >
                      Chat info
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <h1 className="text-xl">{currentChat.name}</h1>
                    <h2 className="text-lg">Users:</h2>
                    <div className="flex flex-col gap-2">
                      {currentChat.users.map((user, i) => (
                        <div className="flex gap-2 items-center">
                          <img
                            className="rounded-full w-8 h-8"
                            src={requiredUsers[user._id]?.image}
                          />
                          <h3 key={i} className="text-md">
                            {requiredUsers[user._id]?.username}
                          </h3>
                          <Select>
                            <SelectTrigger className="ml-auto w-[180px]">
                              <SelectValue placeholder={user.role} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="User">User</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Owner">Owner</SelectItem>
                              <SelectItem value="Author">Author</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger>
                    <Button size={"sm"} className="text-md">
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
                        requiredUsers[message.sender]?.auth0Id === user?.auth0Id
                          ? "bg-gray-400 text-black block ml-auto"
                          : "bg-gray-200 text-black block mr-auto"
                      } px-4 rounded-lg py-2 `}
                    >
                      <div className="flex flex-row items-center">
                        <HoverCard>
                          <HoverCardTrigger className="cursor-pointer">
                            <img
                              className="rounded-full w-8 h-8 pointer"
                              src={requiredUsers[message.sender]?.image}
                            />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <img
                              className="rounded-full w-32 h-32 "
                              src={requiredUsers[message.sender]?.image}
                            />
                            <h1 className="text-xl mt-4">
                              {requiredUsers[message.sender]?.username}
                            </h1>
                            <h2 className="text-md text-gray-500">
                              {requiredUsers[message.sender]?.handle}
                            </h2>
                            <p className="text-md mt-2">
                              {requiredUsers[message.sender]?.info}
                            </p>
                          </HoverCardContent>
                        </HoverCard>

                        <div className=" ml-4">
                          <h3
                            className={`text-sm mb-0 ${
                              requiredUsers[message.sender]?.auth0Id ===
                              user?.auth0Id
                                ? "text-gray-600"
                                : "text-gray-700"
                            }`}
                            style={{ marginBottom: "-0.25rem" }}
                          >
                            {requiredUsers[message.sender]?.username}
                          </h3>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
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
