import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Location } from '../utils/gps';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

export function useSocket(serverUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3000'): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('error', (err: string) => {
      setError(err);
    });

    socket.on('connect_error', () => {
      setError('Failed to connect to server');
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return {
    socket: socketRef.current,
    connected,
    error
  };
}

interface LocationSharingHookProps {
  sessionId: string;
  role: 'sharer' | 'viewer';
  myLocation: Location | null;
}

interface LocationSharingReturn {
  otherUserLocation: Location | null;
  connected: boolean;
  error: string | null;
  sendLocation: (location: Location) => void;
}

export function useLocationSharing({ 
  sessionId, 
  role, 
  myLocation 
}: LocationSharingHookProps): LocationSharingReturn {
  const { socket, connected, error } = useSocket();
  const [otherUserLocation, setOtherUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!socket || !connected) return;

    // Join the session
    socket.emit('join-session', { sessionId, role });

    // Listen for location updates from the other user
    socket.on('location-update', (data: { location: Location; role: string }) => {
      // Only update if it's from the other user
      if (data.role !== role) {
        setOtherUserLocation(data.location);
      }
    });

    return () => {
      socket.off('location-update');
    };
  }, [socket, connected, sessionId, role]);

  // Send location updates
  useEffect(() => {
    if (!socket || !connected || !myLocation) return;

    socket.emit('update-location', {
      sessionId,
      location: myLocation,
      role
    });
  }, [socket, connected, myLocation, sessionId, role]);

  const sendLocation = (location: Location) => {
    if (socket && connected) {
      socket.emit('update-location', {
        sessionId,
        location,
        role
      });
    }
  };

  return {
    otherUserLocation,
    connected,
    error,
    sendLocation
  };
}
