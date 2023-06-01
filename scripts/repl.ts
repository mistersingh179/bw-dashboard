import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";

const foo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
};

const bar = () => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 10);
  });
};

(async () => {
  console.log("starting");
  const allowedAttributes = getScalarFieldsOfModel("Setting");
  console.log(allowedAttributes);
  console.log("finished");
})();

export {};
