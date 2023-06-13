import processAllUsersQueue from "@/jobs/queues/processAllUsersQueue";

const setupCronJobs = async () => {
  console.log("starting scheduling cron jobs");
  const job = await processAllUsersQueue.add("processAllUsers", undefined, {
    repeat: {
      pattern: "0 18 * * *",
    },
  });
  console.log("scheduled job: ", job.queueName, job.name, job.id);
  console.log("finished scheduling cron jobs");
};

export default setupCronJobs;
