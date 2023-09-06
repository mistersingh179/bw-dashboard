import {
  AdvertisementSpot,
  Campaign,
  MetaContent,
  MetaContentSpot,
  ScoredCampaign,
  Setting,
} from "@prisma/client";
import { Content, User, Webpage, Website } from ".prisma/client";
import { MostVisitedUrlsResultType } from "@/services/downloadMostVisitedUrls";
import { WebsiteUrlToCount } from "@/services/process/processWebpagesWithZeroMetaContentSpots";

export type CreateAdvertisementDataType = {
  advertisementSpot: AdvertisementSpot;
  scoredCampaign: ScoredCampaign;
  settings: Setting;
};

export type CreateScoredCampaignDataType = {
  webpage: Webpage;
  content: Content;
  settings: Setting;
  user: User;
  campaigns: Campaign[];
};

export type DownloadWebpagesDataType = {
  website: Website;
  settings: Setting;
  sitemapUrl?: string;
};

export type DownloadMostVisitedUrlsDataType = {
  website: Website;
  settings: Setting;
};

export type MediumInputDataType =
  | DownloadMostVisitedUrlsDataType
  | MetaContentSpot
  | undefined;

export type MediumOutputDataType =
  | MostVisitedUrlsResultType
  | MetaContent[]
  | WebsiteUrlToCount
  | null
  | undefined;

export type MediumJobNames =
  | "downloadMostVisitedUrls"
  | "createMetaContents"
  | "processWebpagesWithZeroMetaContentSpots";

export type ProcessCampaignDataType = {
  campaign: Campaign;
};

export type ProcessUserDataType = { user: User; settings: Setting };

export type ProcessWebpageDataType = { webpage: Webpage };

export type ProcessWebsiteDataType = { website: Website; settings: Setting };
