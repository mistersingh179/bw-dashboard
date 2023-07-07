const getCategoriesFromClasses = (document: Document): string[] => {
  var allClasses = [];
  var allElements = document.querySelectorAll("*");
  for (var i = 0; i < allElements.length; i++) {
    var classes = allElements[i].className.toString().split(/\s+/);
    for (var j = 0; j < classes.length; j++) {
      var cls = classes[j];
      if (cls && allClasses.indexOf(cls) === -1) allClasses.push(cls);
    }
  }
  const categoryClasses = allClasses
    .filter((x) => x.startsWith("category-"))
    .map((x) => x.trim());
  return categoryClasses;
};

export default getCategoriesFromClasses;