import { NextApiRequest } from 'next';
import {Setting} from "@prisma/client";

declare module 'next' {
  export interface NextApiRequest {
    authenticatedUserId?: string;
    requestId?: string;
    settings?: Setting;
  }
}