import { Prisma } from ".prisma/client";

export type CampaignType = {
  id?: string;
  name: string;
  start: string;
  end: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  optimisticValue?: boolean;
  impressionCap: number;
  fixedCpm: number;
  brandName: string;
  brandDescription: string;
  clickUrl: string;
  requiredCssSelector: string;
  pacing: boolean;
  status: boolean;
};
