import { defer } from '@defer/client'

const weeklyProductRecommendations = async () => {
  console.log("in bg job: started weeklyProductRecommendations");
}

export default defer.cron(weeklyProductRecommendations, '* * * * *')