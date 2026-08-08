import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastEvent: any;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastEvent: null
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const getSocketUrl = () => {
      if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
        return 'https://abtalks-backend.onrender.com';
      }
      return 'http://localhost:5000';
    };

    const socketInstance = io(getSocketUrl(), {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('AUTONOMOUS_CYCLE_COMPLETED', (data) => {
      setLastEvent(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
