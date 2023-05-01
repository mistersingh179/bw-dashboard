import { Campaign, WebsiteUrl, Prisma } from ".prisma/client";
import CampaignUncheckedCreateWithoutUserInput = Prisma.CampaignUncheckedCreateWithoutUserInput;

export type CampaignType = Omit<
  Campaign,
  "id" | "start" | "end" | "fixedCpm" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  start: string;
  end: string;
  fixedCpm: number;
  optimisticValue?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WebsiteUrlType = Omit<
  WebsiteUrl,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};
