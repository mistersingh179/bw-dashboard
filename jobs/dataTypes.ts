import {AdvertisementSpot, Campaign, ScoredCampaign, Setting} from "@prisma/client";
import {Content, User, Webpage, Website} from ".prisma/client";
import {MostVisitedUrlsResultType} from "@/services/downloadMostVisitedUrls";

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
}

export type MediumInputDataType = DownloadMostVisitedUrlsDataType;
export type MediumOutputDataType = MostVisitedUrlsResultType | undefined;

export type MediumJobNames = "downloadMostVisitedUrls";

export type ProcessCampaignDataType = {
  campaign: Campaign
}

export type ProcessUserDataType = { user: User; settings: Setting };

export type ProcessWebpageDataType = {webpage: Webpage};

export type ProcessWebsiteDataType = { website: Website; settings: Setting };
