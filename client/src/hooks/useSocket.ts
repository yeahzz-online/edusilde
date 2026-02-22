import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

let socket: Socket | null = null;

export const useSocket = (roomId?: string) => {
    const { user, accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken) return;

        if (!socket) {
            socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                auth: { token: accessToken },
                transports: ['websocket'],
            });
        }

        if (roomId) {
            socket.emit('join-room', roomId);
        } else if (user?.id) {
            socket.emit('join-room', user.id);
        }

        return () => {
            if (socket) {
                if (roomId) {
                    socket.emit('leave-room', roomId);
                } else if (user?.id) {
                    socket.emit('leave-room', user.id);
                }
            }
        };
    }, [user?.id, roomId, accessToken]);

    return socket;
};
