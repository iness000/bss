import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketEventHandlers {
  onAuth?: (data: any) => void;
  onSwapInitiated?: (data: any) => void;
  onSwapResult?: (data: any) => void;
  onSwapRefused?: (data: any) => void;
  onConnect?: (sid: string) => void; // Optional: callback for when connection is established
  onDisconnect?: () => void;    // Optional: callback for disconnection
}

export const useSocket = (eventHandlers: SocketEventHandlers) => {
  const socketRef = useRef<Socket | null>(null);

  // Use a ref for eventHandlers to avoid re-running effect too often if handlers are not memoized
  // However, best practice is to memoize handlers in the calling component (BatterySwapFlow)
  const stableEventHandlersRef = useRef(eventHandlers);
  useEffect(() => {
    stableEventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    // Ensure socket is only created once or on explicit re-connect logic (not implemented here)
    if (!socketRef.current) {
      console.log('[useSocket] Initializing socket connection...');
      socketRef.current = io("http://localhost:5000", {
        // autoConnect: false, // Consider if manual connection is better
        reconnectionAttempts: 5,
      });
    }

    const socket = socketRef.current;

    // Define handlers here to ensure stable references for .off()
    const onConnectHandler = () => {
      console.log('[useSocket] Socket connected! SID:', socket.id);
      if (stableEventHandlersRef.current.onConnect) {
        stableEventHandlersRef.current.onConnect(socket.id!);
      }
    };

    const onDisconnectHandler = () => {
      console.log('[useSocket] Socket disconnected.');
      if (stableEventHandlersRef.current.onDisconnect) {
        stableEventHandlersRef.current.onDisconnect();
      }
    };
    
    // Attach core listeners
    socket.on('connect', onConnectHandler);
    socket.on('disconnect', onDisconnectHandler);

    // Dynamically attach event-specific listeners based on provided handlers
    const { onAuth, onSwapInitiated, onSwapResult, onSwapRefused } = stableEventHandlersRef.current;

    if (onAuth) socket.on("auth_response", onAuth);
    if (onSwapInitiated) socket.on("swap_initiated", onSwapInitiated);
    if (onSwapResult) socket.on("swap_result", onSwapResult);
    if (onSwapRefused) socket.on("swap_refused", onSwapRefused);
    
    console.log('[useSocket] Event listeners attached.');

    // If socket was not auto-connecting, connect it explicitly
    // if (!socket.connected) {
    //   socket.connect();
    // }

    return () => {
      console.log('[useSocket] useEffect cleanup. Detaching listeners and disconnecting socket.');
      socket.off('connect', onConnectHandler);
      socket.off('disconnect', onDisconnectHandler);

      if (onAuth) socket.off("auth_response", onAuth);
      if (onSwapInitiated) socket.off("swap_initiated", onSwapInitiated);
      if (onSwapResult) socket.off("swap_result", onSwapResult);
      if (onSwapRefused) socket.off("swap_refused", onSwapRefused);
      
      // Disconnect the socket when the component unmounts or hook is no longer used
      // This prevents connections from persisting when BatterySwapFlow is not visible
      if (socket.connected) {
        socket.disconnect();
        console.log('[useSocket] Socket explicitly disconnected.');
      }
      socketRef.current = null; // Clean up ref
    };
  // The dependency array is tricky. If eventHandlers are not memoized with useCallback in BatterySwapFlow,
  // this effect will run on every render of BatterySwapFlow. 
  // Using stableEventHandlersRef helps, but memoizing handlers is the primary fix.
  // For now, let's depend on the ref's content changing, which is less frequent if parent memoizes.
  }, []); // Re-run only on mount and unmount for socket creation/destruction
          // Listener re-attachment for specific events is handled by the stableEventHandlersRef if needed,
          // but ideally, the handlers themselves are stable via useCallback.

  // Function to manually emit events if needed, though typically not from this hook
  // const emit = (eventName: string, data: any) => {
  //   if (socketRef.current && socketRef.current.connected) {
  //     socketRef.current.emit(eventName, data);
  //   }
  // };

  // return { emit }; // if you want to expose emit
};
