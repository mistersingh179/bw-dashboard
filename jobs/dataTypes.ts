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

export type ProcessIncomingUrlDataType = {
  userId: string,
  url: string
}

export type DownloadMostVisitedUrlsDataType = {
  website: Website;
  settings: Setting;
};

export type MediumInputDataType =
  | DownloadMostVisitedUrlsDataType
  | MetaContentSpot
  | ProcessIncomingUrlDataType
  | undefined;

export type MediumOutputDataType =
  | MostVisitedUrlsResultType
  | MetaContent[]
  | WebsiteUrlToCount
  | Webpage
  | null
  | undefined;

export type MediumJobNames =
  | "downloadMostVisitedUrls"
  | "createMetaContents"
  | "processWebpagesWithZeroMetaContentSpots"
  | "processIncomingUrl";

export type ProcessCampaignDataType = {
  campaign: Campaign;
};

export type ProcessUserDataType = { user: User; settings: Setting };

export type ProcessWebpageDataType = { webpage: Webpage };

export type ProcessWebsiteDataType = { website: Website; settings: Setting };
