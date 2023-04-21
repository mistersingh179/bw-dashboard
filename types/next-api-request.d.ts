import { NextApiRequest } from 'next';

declare module 'next' {
  export interface NextApiRequest {
    authenticatedUserId?: string;
    requestId?: string;
  }
}