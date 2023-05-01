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

export type WebsiteUrlType =
  Prisma.WebsiteUrlUncheckedCreateWithoutUserInput & {};
