import React, { useEffect } from "react";
import { Box, Button, Stack, Text, useToast, Spinner } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import { ChatState } from "../../context/chatProvider";
import { getSender } from "../Logisitics//chatLogistics";
import GroupChatModal from "../Authentication/miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  // pull everything from context (single source of truth)
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // guard: only fetch when user is present (token available)
    if (!user || !user.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchChats();
    // re-run when fetchAgain or user changes (user likely set after login)
  }, [fetchAgain, user]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* header */}
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text>My Chats</Text>

        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* chats list */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
      >
        {chats ? (
          <Stack spacing={2}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat?._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat?._id === chat._id ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
              >
                <Text fontWeight="medium">
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </Text>

                {chat.latestMessage ? (
                  <Text fontSize="xs" mt={1}>
                    <b>{chat.latestMessage.sender?.name} : </b>
                    {chat.latestMessage.content?.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    No messages yet
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          // while chats is undefined (initial load)
          <ChatLoading />
        )}

        {/* If chats is an empty array, show helpful message */}
        {chats && Array.isArray(chats) && chats.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Text>No chats yet — start a conversation!</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
