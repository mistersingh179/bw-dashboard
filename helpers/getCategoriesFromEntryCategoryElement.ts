const getCategoriesFromEntryCategoryElement = (
  document: Document
): string[] => {
  const entryCategoryElements = [
    ...document.querySelectorAll(".entry-category"),
  ];
  let result: string[] = [];
  for (const entryCategoryElement of entryCategoryElements) {
    let textContent = entryCategoryElement?.textContent ?? "";
    textContent = textContent.replace(/^Tags:\s/, "");
    const entryCategoryValues = textContent.split(",").map((x) => x.trim());
    result = result.concat(entryCategoryValues);
  }
  return result;
};

export default getCategoriesFromEntryCategoryElement;