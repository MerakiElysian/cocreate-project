"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export function useSocket() {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket(token || undefined);
    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
