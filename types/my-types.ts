import { Campaign, Webpage, Website, Prisma } from ".prisma/client";
import CampaignUncheckedCreateWithoutUserInput = Prisma.CampaignUncheckedCreateWithoutUserInput;
import { Setting } from "@prisma/client";
import { WebpageWithDetail } from "@/services/queries/getWebpageDetail";

export type CampaignType = Omit<
  Campaign,
  "id" | "fixedCpm" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  fixedCpm: number;
  optimisticValue?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WebpageType = Omit<
  Webpage,
  "id" | "userId" | "websiteId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  websiteId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WebsiteType = Omit<
  Website,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NullableWebsiteType = WebsiteType | null | undefined;

export type MyErrorType = {
  message: string;
};

export type SettingType = Omit<
  Setting,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  id?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WebpageWithDetailType = Omit<
  WebpageWithDetail,
  "createdAt" | "updatedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
};
