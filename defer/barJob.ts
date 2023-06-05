import {awaitResult, defer} from "@defer/client";
import fooJob from "@/defer/fooJob";

const barJob = async () => {
  console.log("started barJob");
  const fooJobWithResult = awaitResult(fooJob);
  await fooJobWithResult();
  console.log("finished barJob");
};

export default defer(barJob, {
  retry: 1,
  concurrency: 20,
});
