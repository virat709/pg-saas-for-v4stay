/**
 * useIsReturningUser — detects whether this user has logged in before.
 *
 * Storage keys:
 *   v4stay_has_logged_in  — boolean flag, persists across sessions
 *   v4stay_user_name      — user's first name for the welcome-back greeting
 *
 * Usage:
 *   const { isReturning, firstName, markAsLoggedIn } = useIsReturningUser();
 */
"use client";
import { useState, useEffect } from "react";

const FLAG_KEY = "v4stay_has_logged_in";
const NAME_KEY = "v4stay_user_name";
// Session key: prevents replaying WelcomeBack on every internal navigation
const SESSION_SHOWN_KEY = "v4stay_welcome_shown_this_session";

export function useIsReturningUser() {
  const [isReturning, setIsReturning] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [welcomeShownThisSession, setWelcomeShownThisSession] = useState(false);

  useEffect(() => {
    // Guard: localStorage is client-only
    try {
      const hasLoggedIn = localStorage.getItem(FLAG_KEY) === "true";
      const name = localStorage.getItem(NAME_KEY) || "";
      const shownThisSession = sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";

      setIsReturning(hasLoggedIn);
      setFirstName(name.split(" ")[0]); // Use first name only
      setWelcomeShownThisSession(shownThisSession);
    } catch {
      // Private browsing / storage blocked — treat as new user
    }
  }, []);

  /**
   * Call this on successful login/register.
   * Sets the returning-user flag and stores the user's name.
   */
  function markAsLoggedIn(fullName?: string) {
    try {
      const alreadyFlagged = localStorage.getItem(FLAG_KEY) === "true";
      if (!alreadyFlagged) {
        // First ever login — mark them as returning for NEXT session
        localStorage.setItem(FLAG_KEY, "true");
      }
      if (fullName) {
        localStorage.setItem(NAME_KEY, fullName);
      }
    } catch {
      // Silently fail in restricted environments
    }
  }

  /**
   * Call this after the WelcomeBack animation has played.
   * Prevents replaying it on every internal navigation within the same session.
   */
  function markWelcomeShown() {
    try {
      sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
      setWelcomeShownThisSession(true);
    } catch {
      // ignore
    }
  }

  return {
    isReturning,
    firstName,
    welcomeShownThisSession,
    markAsLoggedIn,
    markWelcomeShown,
  };
}
