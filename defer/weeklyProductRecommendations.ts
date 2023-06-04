import { defer } from "@defer/client";

const weeklyProductRecommendations = async () => {
  console.log("started bg job: started weeklyProductRecommendations");
  console.log("finished bg job: started weeklyProductRecommendations");
};

export default defer.cron(weeklyProductRecommendations, "0 * * * *");
