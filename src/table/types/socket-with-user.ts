import { Socket } from 'socket.io';

export interface AuthenticatedSocketData {
  userId: string;
  email: string;
  chronicleId?: string;
}

export type AuthenticatedSocket = Socket<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  AuthenticatedSocketData
>;
