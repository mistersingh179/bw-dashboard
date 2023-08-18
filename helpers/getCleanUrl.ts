import {getUrlProperties} from "@/pages/api/auctions/generate";

export const getCleanUrl = (url: string): string => {
  try {
    const { originWithPathName } = getUrlProperties(url);
    return originWithPathName;
  } catch (err) {
    console.log("got error while cleaning url: ", url);
  }
  return "";
};