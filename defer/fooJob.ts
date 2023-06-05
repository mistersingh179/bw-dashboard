import { defer } from "@defer/client";

const fooJob = async () => {
  console.log("started fooJob");
  console.log("finished fooJob");
};

export default defer(fooJob, {
  retry: 1,
  concurrency: 20,
});
