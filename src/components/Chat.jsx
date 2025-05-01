import React, { useEffect, useState, useRef } from "react";
import SideNav from "./SideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { ArrowLeft, Trash2, Check, CheckCheck } from "lucide-react";

export default function Chat() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chattedUsers, setChattedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const scrollRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageTimeRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const fetchData = async () => {
      if (user) {
        const email = user.email;
        const safeEmail = email.replace(/\./g, "_");
        const safeEmailForApi = email;
        setCurrentUserEmail(email);

        const db = getDatabase();
        const profileImageRef = ref(
          db,
          `userProfiles/${safeEmail}/profileImageUrl`
        );

        try {
          setIsLoading(true);
          const imageSnap = await get(profileImageRef);
          setAvatarUrl(imageSnap.exists() ? imageSnap.val() : null);

          const response = await fetch(
            `http://localhost:8081/api/messages/get-chatted-users?currentUserEmail=${safeEmailForApi}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const users = await response.json();

          const usersWithAvatars = await Promise.all(
            users.map(async (user) => {
              const userSafeEmail = user.email.replace(/\./g, "_");
              const imageRef = ref(
                db,
                `userProfiles/${userSafeEmail}/profileImageUrl`
              );
              const imageSnapshot = await get(imageRef);
              const avatarUrl = imageSnapshot.exists()
                ? imageSnapshot.val()
                : null;

              const userNameRef = ref(db, `userProfiles/${userSafeEmail}/name`);
              const nameSnapshot = await get(userNameRef);
              const name = nameSnapshot.exists()
                ? nameSnapshot.val()
                : user.email.split("@")[0];

              return {
                ...user,
                avatarUrl,
                name,
              };
            })
          );

          setChattedUsers(usersWithAvatars);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      );
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);
    return () => {
      clearInterval(intervalId);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (selectedChat && currentUserEmail) {
      fetchChatLog(selectedChat.user.email, selectedChat.chatId);

      pollingIntervalRef.current = setInterval(() => {
        fetchChatLog(selectedChat.user.email, selectedChat.chatId, true);
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedChat, currentUserEmail]);

  useEffect(() => {
    if (selectedChat && chatLog.length > 0 && currentUserEmail) {
      const unreadMessages = chatLog.filter(
        (msg) => !msg.seen && msg.sender !== currentUserEmail
      );

      unreadMessages.forEach((msg) => {
        markMessageAsSeen(msg.id);
      });
    }
  }, [chatLog, selectedChat, currentUserEmail]);

  const markMessageAsSeen = async (messageId) => {
    if (!selectedChat || !messageId) return;

    try {
      const response = await fetch(
        `http://localhost:8081/api/messages/seen?senderEmail=${encodeURIComponent(
          selectedChat.user.email
        )}&receiverEmail=${encodeURIComponent(
          currentUserEmail
        )}&messageId=${messageId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark message as seen: ${response.statusText}`
        );
      }

      setChatLog((prevChatLog) =>
        prevChatLog.map((msg) =>
          msg.id === messageId ? { ...msg, seen: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const numericTimestamp =
      typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;

    if (isNaN(numericTimestamp)) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid time";
    }

    const timestampInMs =
      numericTimestamp < 10000000000
        ? numericTimestamp * 1000
        : numericTimestamp;

    const date = new Date(timestampInMs);

    if (isNaN(date.getTime())) {
      console.error("Invalid date from timestamp:", timestamp);
      return "Invalid time";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchChatLog = async (otherUserEmail, chatId, isPolling = false) => {
    try {
      let currentChatId = chatId;
      if (!currentChatId) {
        const chatRoomResponse = await fetch(
          `http://localhost:8081/api/messages/getchatroom?senderEmail=${encodeURIComponent(
            currentUserEmail
          )}&receiverEmail=${encodeURIComponent(otherUserEmail)}`
        );

        if (!chatRoomResponse.ok) {
          throw new Error(
            `Failed to get chat room: ${chatRoomResponse.statusText}`
          );
        }

        currentChatId = await chatRoomResponse.text();
      }

      const messagesResponse = await fetch(
        `http://localhost:8081/api/messages/get?senderEmail=${encodeURIComponent(
          currentUserEmail
        )}&receiverEmail=${encodeURIComponent(otherUserEmail)}`
      );

      if (!messagesResponse.ok) {
        throw new Error(
          `Failed to load messages: ${messagesResponse.statusText}`
        );
      }

      const messages = await messagesResponse.json();

      const formattedMessages = messages.map((msg) => {
        let msgTimestamp;
        if (msg.timestamp) {
          msgTimestamp = parseInt(msg.timestamp, 10);
        } else {
          msgTimestamp = Math.floor(Date.now() / 1000);
        }

        const formattedTime = formatMessageTime(msgTimestamp);

        return {
          id: msg.messageId,
          text: msg.text,
          timestamp: msgTimestamp,
          time: formattedTime,
          sender: msg.senderEmail,
          avatarUrl:
            msg.senderEmail === currentUserEmail
              ? avatarUrl
              : selectedChat?.user?.avatarUrl,
          seen: msg.seen,
        };
      });

      if (isPolling) {
        if (formattedMessages.length > chatLog.length) {
          setChatLog(formattedMessages);
        } else if (formattedMessages.length === chatLog.length) {
          const seenStatusChanged = formattedMessages.some(
            (msg, idx) => msg.seen !== chatLog[idx].seen
          );
          if (seenStatusChanged) {
            setChatLog(formattedMessages);
          }
        }
      } else {
        setChatLog(formattedMessages);
      }

      return currentChatId;
    } catch (err) {
      console.error("Error loading chat messages:", err);
      return chatId;
    }
  };

  const handleSend = async () => {
    if (message.trim() && selectedChat) {
      try {
        const now = Math.floor(Date.now() / 1000);

        const formattedTime = formatMessageTime(now);

        const tempMsg = {
          id: `temp-${now}`,
          text: message,
          timestamp: now,
          time: formattedTime,
          sender: currentUserEmail,
          avatarUrl: avatarUrl,
          isSending: true,
        };

        setChatLog((prevChatLog) => [...prevChatLog, tempMsg]);

        const formData = new FormData();
        formData.append("senderEmail", currentUserEmail);
        formData.append("receiverEmail", selectedChat.user.email);
        formData.append("text", message);
        formData.append("timestamp", now.toString());

        const response = await fetch(
          "http://localhost:8081/api/messages/send",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        setMessage("");

        setTimeout(async () => {
          await fetchChatLog(selectedChat.user.email, selectedChat.chatId);
        }, 500);
      } catch (error) {
        console.error("Error sending message:", error);
        setChatLog((prevChatLog) =>
          prevChatLog.filter((msg) => !msg.id.startsWith("temp-"))
        );
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/messages/delete?senderEmail=${encodeURIComponent(
          currentUserEmail
        )}&receiverEmail=${encodeURIComponent(
          selectedChat.user.email
        )}&messageId=${msgId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      setChatLog((prevChatLog) =>
        prevChatLog.filter((msg) => msg.id !== msgId)
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  const handleUserSelect = async (user, chatId) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setSelectedChat({ user, chatId });
    const updatedChatId = await fetchChatLog(user.email, chatId);

    if (updatedChatId !== chatId) {
      setSelectedChat((prev) => ({ ...prev, chatId: updatedChatId }));
    }
  };

  const handleBack = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setSelectedChat(null);
    setChatLog([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <SideNav />
      <main className="flex-1 p-6 lg:p-10 text-white">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">Chat</h1>
            <p className="text-sm text-white/70">Start a conversation</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              ⏰ {currentTime}
            </div>
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              📅 {currentDate}
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xl">👤</span>
              )}
            </div>
          </div>
        </div>

        {/* Main View */}
        {!selectedChat ? (
          <div className="bg-white/10 p-6 rounded-2xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : chattedUsers.length === 0 ? (
                <p className="text-white/70">
                  You haven't chatted with anyone yet.
                </p>
              ) : (
                chattedUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="hover:bg-white/20 p-3 rounded-xl cursor-pointer flex items-center gap-3"
                    onClick={() => handleUserSelect(user, user.chatId)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-white/60">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 p-6 rounded-2xl shadow-md max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={handleBack} className="text-white text-lg">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {selectedChat.user.avatarUrl ? (
                    <img
                      src={selectedChat.user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl">👤</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedChat.user.name}
                  </h3>
                  <p className="text-sm text-white/60">
                    {selectedChat.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="max-h-[400px] overflow-y-auto mb-4 p-2">
              {chatLog.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                chatLog.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-4 mb-3 ${
                      msg.sender === currentUserEmail
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {msg.sender !== currentUserEmail && (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        {selectedChat.user.avatarUrl ? (
                          <img
                            src={selectedChat.user.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl">👤</span>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] ${
                        msg.sender === currentUserEmail
                          ? "bg-blue-500/80"
                          : "bg-white/20"
                      } p-3 rounded-xl`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-white/60">
                          {msg.time}
                        </span>
                        {msg.isSending && (
                          <span className="text-xs text-white/60 ml-2">
                            Sending...
                          </span>
                        )}
                        {msg.sender === currentUserEmail && !msg.isSending && (
                          <span className="text-xs text-white/60 ml-2">
                            {msg.seen ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {msg.sender === currentUserEmail && (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-500 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ml-2">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl">👤</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <div className="flex items-center gap-3 mt-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/10 text-white w-full px-4 py-2 rounded-xl"
                placeholder="Type a message"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`px-6 py-2 rounded-xl ${
                  !message.trim()
                    ? "bg-white/50 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90 transition-colors"
                }`}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
