import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

import {
  setAccessToken,
  clearAccessToken,
} from "../api/tokenStore";

const AuthContext =
  createContext(null);

// Same key Chat.jsx uses to persist the active conversation.
// Kept here too so any logout path clears it consistently.
const ACTIVE_CONVERSATION_KEY =
  "financeTrackerActiveConversationId";

function getUserFromResponse(
  userData
) {
  if (!userData) {
    return null;
  }

  return {
    _id: userData._id,
    name: userData.name,
    email: userData.email,
  };
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const { data } =
          await api.post(
            "/auth/refresh",
            {},
            {
              _skipAuthRefresh: true,
            }
          );

        if (!mounted) {
          return;
        }

        setAccessToken(
          data.accessToken
        );

        setUser(
          getUserFromResponse(data)
        );
      } catch (error) {
        clearAccessToken();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    function handleSessionRefresh(
      event
    ) {
      if (!mounted) {
        return;
      }

      const data =
        event.detail;

      setAccessToken(
        data.accessToken
      );

      setUser(
        getUserFromResponse(data)
      );
    }

    function handleAuthLogout() {
      clearAccessToken();

      localStorage.removeItem(
        ACTIVE_CONVERSATION_KEY
      );

      if (mounted) {
        setUser(null);
      }
    }

    window.addEventListener(
      "auth:refreshed",
      handleSessionRefresh
    );

    window.addEventListener(
      "auth:logout",
      handleAuthLogout
    );

    restoreSession();

    return () => {
      mounted = false;

      window.removeEventListener(
        "auth:refreshed",
        handleSessionRefresh
      );

      window.removeEventListener(
        "auth:logout",
        handleAuthLogout
      );
    };
  }, []);

  function login(userData) {
    setAccessToken(
      userData.accessToken
    );

    setUser(
      getUserFromResponse(
        userData
      )
    );
  }

  async function logout() {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          _skipAuthRefresh: true,
        }
      );
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      clearAccessToken();

      localStorage.removeItem(
        ACTIVE_CONVERSATION_KEY
      );

      setUser(null);
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}