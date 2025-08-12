// BuyerNotification.jsx with real-time notifications and email alerts
import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, onValue, set } from "firebase/database";
import BuyerSideNav from "./BuyerSideNav";
import emailjs from "@emailjs/browser";

export default function BuyerNotification() {
  const [notifications, setNotifications] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const saveSeenNotificationsToFirebase = async (email, seenIds) => {
    if (!email || !seenIds || seenIds.length === 0) return;

    try {
      const db = getDatabase();
      const sanitizedEmail = email.replace(/\./g, ",");
      const seenRef = ref(db, `userSeenNotifications/${sanitizedEmail}`);
      await set(seenRef, seenIds);
      //console.log("Saved seen notifications to Firebase");
    } catch (error) {
      console.error("Error saving seen notifications to Firebase:", error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user?.email) {
      setUserEmail(user.email);
    }

    const updateTimeAndDate = () => {
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

    const intervalId = setInterval(updateTimeAndDate, 60000);
    updateTimeAndDate();

    const fetchUserAvatar = async () => {
      if (user?.email) {
        const safeEmail = user.email.replace(/\./g, "_");
        const db = getDatabase();
        const profileRef = ref(
          db,
          "userProfiles/" + safeEmail + "/profileImageUrl"
        );

        try {
          setIsLoadingAvatar(true);
          const profileSnapshot = await get(profileRef);
          if (profileSnapshot.exists()) {
            const imageUrl = profileSnapshot.val();
            if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
              setAvatarUrl(imageUrl);
            } else {
              setAvatarUrl("");
            }
          } else {
            setAvatarUrl("");
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
          setAvatarUrl("");
        } finally {
          setIsLoadingAvatar(false);
        }
      }
    };

    fetchUserAvatar();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        setSeenNotifications(new Set());

        loadSeenNotificationsFromFirebase(user.email);
      } else {
        setUserEmail("");
        setSeenNotifications(new Set());
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSeenNotificationsFromFirebase = async (email) => {
    if (!email) return;

    try {
      const db = getDatabase();
      const sanitizedEmail = email.replace(/\./g, ",");
      const seenRef = ref(db, `userSeenNotifications/${sanitizedEmail}`);

      const snapshot = await get(seenRef);
      if (snapshot.exists()) {
        const seenIds = snapshot.val();
        setSeenNotifications(new Set(seenIds));
        console.log("Loaded seen notifications from Firebase:", seenIds);
      } else {
        console.log("No seen notifications found in Firebase");
        setSeenNotifications(new Set());
      }
    } catch (error) {
      console.error("Error loading seen notifications from Firebase:", error);
      setSeenNotifications(new Set());
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userEmail) return;

      try {
        setLoading(true);
        const sanitizedEmail = userEmail.replace(".", ",");
        const response = await fetch(
          `http://localhost:8081/api/notifications/${sanitizedEmail}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        console.log("Raw notification data:", data);

        if (!data || data.length === 0) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const processedData = data
          .filter((notification) => notification && notification.id)
          .map((notification) => ({
            ...notification,
            title: notification.title || "Notification",
            message: notification.message || "No content",
            type: notification.type || "info",
          }));

        setNotifications(
          processedData.sort((a, b) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return timeB - timeA;
          })
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchNotifications();
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail && seenNotifications.size > 0) {
      const seenArray = [...seenNotifications];
      saveSeenNotificationsToFirebase(userEmail, seenArray);
    }
  }, [seenNotifications, userEmail]);

  useEffect(() => {
    if (!userEmail) return;

    const db = getDatabase();
    const sanitizedEmail = userEmail.replace(".", ",");
    const notificationsRef = ref(db, `notifications/${sanitizedEmail}`);

    const unsubscribe = onValue(notificationsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setNotifications([]);
        return;
      }

      try {
        const notificationsData = [];
        const unseenNotifications = [];

        const db = getDatabase();
        const sanitizedEmail = userEmail.replace(/\./g, ",");
        const seenPath = `userSeenNotifications/${sanitizedEmail}`;
        const seenSnapshot = await get(ref(db, seenPath));

        const seenNotificationIds = new Set();
        if (seenSnapshot.exists()) {
          seenSnapshot.forEach((childSnap) => {
            const seenId = childSnap.val();
            if (seenId) {
              seenNotificationIds.add(seenId);
            }
          });
        }

        let index = seenNotificationIds.size;

        snapshot.forEach((childSnapshot) => {
          const notification = childSnapshot.val();
          if (notification && notification.id) {
            notificationsData.push({
              ...notification,
              id: notification.id,
            });

            if (!seenNotificationIds.has(notification.id)) {
              unseenNotifications.push(notification);
            }
          }
        });

        if (unseenNotifications.length > 0) {
          sendEmailNotification(unseenNotifications);

          unseenNotifications.forEach((n) => {
            const refPath = `userSeenNotifications/${sanitizedEmail}/${index}`;
            set(ref(db, refPath), n.id);
            index++;
          });
        }

        const sortedData = notificationsData.sort((a, b) => {
          const timeA = a.timestamp || 0;
          const timeB = b.timestamp || 0;
          return timeB - timeA;
        });

        setNotifications(sortedData);
      } catch (err) {
        console.error("Error processing real-time notifications:", err);
      }
    });

    return () => unsubscribe();
  }, [userEmail, seenNotifications]);

  const sendEmailNotification = async (newNotifications) => {
    if (!userEmail || newNotifications.length === 0) return;

    try {
      const emailJsServiceId = "service_hyduv7q";
      const emailJsTemplateId = "template_0s27ymj";
      const emailJsPublicKey = "rFM5rnnJdHx33T9Ll";

      const templateParams = {
        to_email: userEmail,
        message: newNotifications.map((n) => `${n.message}`).join("\n\n"),
      };

      emailjs.init(emailJsPublicKey);

      const result = await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        templateParams
      );

      console.log("Email notification sent successfully:", result.text);
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return "Unknown date";
      let timeValue = Number(timestamp);
      if (!isNaN(timeValue) && isFinite(timeValue)) {
        if (timeValue < 10000000000) {
          timeValue *= 1000;
        }

        const date = new Date(timeValue);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(date);
        }
      }

      const fallbackDate = new Date(timestamp);
      if (!isNaN(fallbackDate.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(fallbackDate);
      }

      return "Unknown date";
    } catch (e) {
      console.error("Error formatting date:", e, "Value was:", timestamp);
      return "Invalid date";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "warning":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Bell className="text-blue-500" size={20} />;
    }
  };

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <div
      className="flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <BuyerSideNav />

      <div className="min-h-screen p-10 text-white flex-grow">
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-sm text-white/70">View your notifications</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              ⏰ {currentTime}
            </div>
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              📅 {currentDate}
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {isLoadingAvatar ? (
                <div className="w-8 h-8 border-4 border-t-4 border-white/50 border-solid rounded-full animate-spin"></div>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                  onError={() => {
                    console.log("Error loading image.");
                    setAvatarUrl("");
                  }}
                />
              ) : (
                <span className="text-2xl text-white/50">👤</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader className="animate-spin text-white mb-2" size={24} />
              <p className="text-white/70">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-white/5 rounded-lg border border-red-400/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-400" size={24} />
                <h2 className="text-lg font-semibold text-white">
                  Something went wrong
                </h2>
              </div>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                className="px-4 py-2 bg-[#4c2b1f] text-white rounded-xl hover:bg-[#6e3f2d] transition"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bell size={20} />
                  Your Notifications
                </h2>
                <span className="bg-[#4c2b1f] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="mx-auto text-white/40 mb-3" size={32} />
                  <p className="text-white/70">No notifications yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {displayedNotifications.map((notification, index) => (
                      <div
                        key={notification.id || index}
                        className="flex items-start p-3 hover:bg-white/5 rounded-md transition-colors border-b border-white/10 last:border-0"
                      >
                        <div className="mr-3 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-white/50">
                              {formatDate(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-white/70 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {notifications.length > 5 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full py-2 text-sm text-white/80 hover:text-white font-medium text-center border-t border-white/10"
                    >
                      {showAll
                        ? "Show Less"
                        : `View All (${notifications.length})`}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
