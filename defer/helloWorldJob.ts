import {defer} from "@defer/client";

const helloWorldJob = async () => {
  console.log("started helloWorldJob");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("finished helloWorldJob");
      reject(void(0));
    }, 2000);
  });
}

export default defer(helloWorldJob);