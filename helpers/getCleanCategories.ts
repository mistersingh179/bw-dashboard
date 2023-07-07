function getCleanCategories(arr: (string | null | undefined)[]): string[] {
  const trimmedArray = arr.map((str) => {
    if (typeof str === "string") {
      return str.trim();
    }
    return "";
  });

  const cleanedArray = [...new Set(trimmedArray)];
  const filteredArray = cleanedArray.filter((str) => str !== "");

  return filteredArray;
}

export default getCleanCategories;
