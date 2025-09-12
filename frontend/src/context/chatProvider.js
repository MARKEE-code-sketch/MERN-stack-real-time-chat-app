import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; // ✅ v5 uses useHistory

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useHistory(); // ✅ history object is available in v5

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/"); // ✅ works in v5
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// helper hook to use context
export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
