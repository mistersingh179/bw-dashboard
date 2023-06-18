import { NextApiRequest } from 'next';
import {Setting} from "@prisma/client";

declare module 'next' {
  export interface NextApiRequest {
    authenticatedUserId?: string;
    reqId?: string;
    settings?: Setting;
  }
}