// // src/hooks/useAuthActions.ts
// import { useAuth, User } from "@/context/AuthContext";
// import { useNavigate } from "react-router-dom";

// /**
//  * Unified hook for handling auth success actions:
//  * - Persist user + token to context and localStorage
//  * - Navigate to desired route
//  */
// export const useAuthActions = () => {
//   const { setUser, setToken } = useAuth();
//   const navigate = useNavigate();

//   /**
//    * Persist auth state to context and localStorage
//    */
//   const persistAuth = (userData: User, token: string ) => {
//     setUser(userData);
//     setToken(token);
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };

//   /**
//    * Handle successful login/registration:
//    * - Persist auth state
//    * - Navigate to target route
//    */
//   const handleLoginSuccess = (
//     userData: User,
//     token: string,
//     redirectPath = "/"
//   ) => {
//     persistAuth(userData, token);
//     navigate(redirectPath);
//   };

//   return { handleLoginSuccess, persistAuth };
// };