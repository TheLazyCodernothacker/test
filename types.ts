type UserType = {
  username: string;
  _id: string;
  image: string;
  handle: string;
  groupchats: string[];
  info: string;
  save: () => Promise<void>;
  auth0Id: string;
};

type ChatType = {
  messages: MessageType[];
  users: {
    role: "User" | "Admin" | "Owner" | "Author";
    _id: string;
  }[];
  info: string;
  save: () => Promise<void>;
  name: string;
  _id: string;
};

type MessageType = {
  sender: string;
  content: string;
  timestamp: string;
};

type UserClientType = {
  username?: string;
  _id?: string;
  image?: string;
  handle?: string;
  groupchats?: ChatType[];
  info?: string;
  auth0Id?: string;
};

type SessionType = {
  message: string;
  user?: UserClientType;
};

export type { UserType, ChatType, MessageType, UserClientType, SessionType };
