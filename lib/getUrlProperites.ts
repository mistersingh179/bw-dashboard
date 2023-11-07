import prisma from "@/lib/prisma";

export type UrlProperties = {
  origin: string;
  originWithPathName: string;
};

export const getUrlProperties = (url: string): UrlProperties => {
  const urlObj = new URL(url);
  const origin = urlObj.origin;
  let originWithPathName = urlObj.origin + urlObj.pathname;
  if (originWithPathName.endsWith("/")) {
    originWithPathName = originWithPathName.slice(0, -1);
  }
  return { origin, originWithPathName };
};

if (require.main === module) {
  (async () => {
    console.log("in getUrlProperties");
    const ans = getUrlProperties(
      "https://outinjersey.net/wicked-lessons-for-us-all-at-the-academy-of-music-in-philly"
    );
    console.log(ans);
  })();
}
