// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
