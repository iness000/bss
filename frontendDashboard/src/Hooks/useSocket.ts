import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with your backend URL if needed

export const useSocket = (onEvents: {
  onAuth?: (data: any) => void;
  onSwapInitiated?: (data: any) => void;
  onSwapResult?: (data: any) => void;
  onSwapRefused?: (data: any) => void;
}) => {
  useEffect(() => {
    socket.on("auth_response", onEvents.onAuth || (() => {}));
    socket.on("swap_initiated", onEvents.onSwapInitiated || (() => {}));
    socket.on("swap_result", onEvents.onSwapResult || (() => {}));
    socket.on("swap_refused", onEvents.onSwapRefused || (() => {}));

    return () => {
      socket.off("auth_response");
      socket.off("swap_initiated");
      socket.off("swap_result");
      socket.off("swap_refused");
    };
  }, []);
};
