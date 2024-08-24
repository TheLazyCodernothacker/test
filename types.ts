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
  users: UserType[];
  info: string;
  save: () => Promise<void>;
  name: string;
  _id: string;
};

type MessageType = {
  sender: UserClientType;
  content: string;
  timestamp: string;
};

type UserClientType = {
  message: string;
  username?: string;
  _id?: string;
  image?: string;
  handle?: string;
  groupchats?: ChatType[];
  info?: string;
  auth0Id?: string;
};

export type { UserType, ChatType, MessageType, UserClientType };
