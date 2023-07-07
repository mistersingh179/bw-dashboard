const getCategoriesFromMetaTags = (document: Document): string[] => {
  const metaContentValues = [
    ...document.querySelectorAll(
      `meta[property='article:tag'],
        meta[property='article:section'],
         meta[property^="og:tax"]`
    ),
  ]
    .map((x) => x.getAttribute("content") || "")
    .map((x) => x.trim());
  return metaContentValues;
};

export default getCategoriesFromMetaTags;