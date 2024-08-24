type User = {
  name: string;
  _id: string;
  image: string;
  handle: string;
  groupChats: Chat[];
};

type Chat = {
  messages: Message[];
  users: User[];
  info: string;
}

type Message = {
    sender: User;
    content: string;
}

export type {User, Chat, Message}