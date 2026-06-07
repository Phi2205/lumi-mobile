import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/services/axiosInstance';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  console.log('[Socket] Initializing socket.io connection to:', API_URL);

  socket = io(API_URL, {
    autoConnect: false,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to gateway server successfully, Socket ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected from gateway server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  return socket;
};

export const connectSocket = async (): Promise<Socket> => {
  const currentSocket = getSocket();
  if (currentSocket.connected) return currentSocket;

  try {
    const token = await getAccessToken();
    if (token) {
      currentSocket.auth = { token };
      console.log('[Socket] Attached auth token for connection');
    } else {
      console.log('[Socket] No auth token found, connecting as guest');
    }
    currentSocket.connect();
  } catch (error) {
    console.error('[Socket] Error retrieving access token for socket:', error);
    currentSocket.connect();
  }

  return currentSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('[Socket] Disconnected socket manually');
  }
};
