import { Campaign, Webpage, Website, Prisma } from ".prisma/client";
import CampaignUncheckedCreateWithoutUserInput = Prisma.CampaignUncheckedCreateWithoutUserInput;
import {Setting} from "@prisma/client";

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
  "id" | "userId" | "websiteId" | "createdAt" | "updatedAt" | "lastModifiedAt"
> & {
  id?: string;
  userId?: string;
  websiteId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedAt?: string;
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

export type SettingType = Omit<
  Setting,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};
