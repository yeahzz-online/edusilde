import { Server } from 'socket.io';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                name: string;
            };
            io?: Server;
        }
    }
}
