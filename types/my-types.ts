import { Prisma } from ".prisma/client";
import CampaignUncheckedCreateWithoutUserInput = Prisma.CampaignUncheckedCreateWithoutUserInput;

export type CampaignType = Omit<
  CampaignUncheckedCreateWithoutUserInput,
  "start" | "end" | "fixedCpm"
> & {
  start: string;
  end: string;
  fixedCpm: number;
};

export type WebsiteUrlType = {
  id?: string;
  url: string;
  corpus: string;
  status: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};
