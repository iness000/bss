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
    console.log('[useSocket] useEffect triggered. Attaching/Re-attaching listeners.');
    socket.on('connect', () => {
      console.log('[useSocket] Socket connected! SID:', socket.id);
    });
    if (onEvents.onAuth) socket.on("auth_response", onEvents.onAuth);
    if (onEvents.onSwapInitiated) socket.on("swap_initiated", onEvents.onSwapInitiated);
    if (onEvents.onSwapResult) socket.on("swap_result", onEvents.onSwapResult);
    if (onEvents.onSwapRefused) socket.on("swap_refused", onEvents.onSwapRefused);

    return () => {
     console.log('[useSocket] useEffect cleanup. Detaching listeners.');
     socket.off('connect');
     if (onEvents.onAuth) socket.off("auth_response");
     if (onEvents.onSwapInitiated) socket.off("swap_initiated");
     if (onEvents.onSwapResult) socket.off("swap_result");
     if (onEvents.onSwapRefused) socket.off("swap_refused");
    };
  }, [onEvents]);
};
