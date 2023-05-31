import {awaitResult} from "@defer/client";
import helloWorldJob from "@/defer/helloWorldJob";

(async () => {
  console.log("started");
  const helloWorldJobWithResult = awaitResult(helloWorldJob);
  const promiseResult = helloWorldJobWithResult();
  const allResult = await Promise.allSettled([promiseResult]);
  console.log("allResult: ", allResult[0].status);
  console.log("ended");
})();

export {}
