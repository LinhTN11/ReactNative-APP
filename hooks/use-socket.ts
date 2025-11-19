import { SOCKET_SERVER_URL } from '@/constants/firebase';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
  imageUrl?: string;
}

interface UserStatus {
  userId: string;
  userName?: string;
  onlineCount?: number;
}

export function useSocket(userId: string | null, userName: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!userId || !userName) return;

    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Notify server of user join
      socket.emit('user-join', { userId, userName });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('user-online', (data: UserStatus) => {
      console.log('User online:', data);
      if (data.onlineCount !== undefined) {
        setOnlineCount(data.onlineCount);
      }
    });

    socket.on('user-offline', (data: UserStatus) => {
      console.log('User offline:', data);
      if (data.onlineCount !== undefined) {
        setOnlineCount(data.onlineCount);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, userName]);

  const sendMessage = (message: SocketMessage) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', message);
    }
  };

  const onNewMessage = (callback: (message: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  };

  return {
    isConnected,
    onlineCount,
    sendMessage,
    onNewMessage,
  };
}
