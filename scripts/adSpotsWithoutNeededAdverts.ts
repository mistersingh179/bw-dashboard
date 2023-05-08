import prisma from "@/lib/prisma";

(async () => {
  console.log("in script adSpotsWithoutNeededAdverts");
  const advertisementSpotsWithoutTrueStatus = await prisma.advertisementSpot.findMany({
    where: {
      NOT: {
        advertisements: {
          some: {
            scoredCampaign: {
              NOT: {
                advertisements: {
                  some: { status: true }
                }
              }
            }
          }
        }
      }
    },
    include: {
      advertisements: {
        include: {
          scoredCampaign: {
            include: {
              campaign: true
            }
          }
        }
      }
    }
  });
  // console.dir(advertisementSpotsWithoutTrueStatus[0], {depth: null});
  for (const a of advertisementSpotsWithoutTrueStatus[0].advertisements){
    console.log(a.advertisementSpotId, a.scoredCampaign.campaign.productName, a.scoredCampaign.campaign.productDescription)
  }

})();

export {}
