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
