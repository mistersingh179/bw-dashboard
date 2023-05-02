import { Campaign, Webpage, Website, Prisma } from ".prisma/client";
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

export type WebpageType = Omit<
  Webpage,
  "id" | "userId" | "websiteId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  websiteId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WebsiteType = Omit<
  Website,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};
