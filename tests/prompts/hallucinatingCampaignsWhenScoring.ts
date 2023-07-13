import prisma from "@/lib/prisma";
import getCampaignsWithTheirScores from "@/services/prompts/getCampaignsWithTheirScores";
import campaigns from "@/pages/api/campaigns";

const MAX_COUNT = 100;

(async () => {
  console.log("in prompt test – hallucinatingCampaignsWhenScoring");

  const users = await prisma.user.findMany({
    where: {
      // id: "clij1cjb60000mb08uzganxdq",
      setting: {
        isNot: null,
      },
    },
    include: {
      campaigns: true,
      setting: true,
      websites: {
        include: {
          webpages: {
            take: 5,
            orderBy: {
              createdAt: "asc",
            },
            include: {
              content: true,
            },
          },
        },
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  let count = 0;
  for (const user of users) {
    console.log(
      user.email,
      user.campaigns.length,
      user.websites[0]?.webpages.length
    );
    if (user.websites[0]?.webpages.length > 0) {
      for (const webpage of user.websites[0].webpages) {
        if (webpage.content === null || user.setting === null) {
          continue;
        }
        console.log("#: ", count, " with ", webpage.url, user.campaigns.length);

        getCampaignsWithTheirScores(
          webpage,
          user.campaigns,
          webpage.content,
          user.setting
        )
          .then((campaignsWithScore) => {
            console.log("*** INPUT *** ");
            console.table(
              user.campaigns.map((c) => ({
                id: c.id,
                name: c.productName,
                url: webpage.url,
              }))
            );
            console.log("*** OUTPUT *** ");
            console.table(
              campaignsWithScore.map((c) => ({
                id: c.id,
                name: c.name,
                score: c.score,
              }))
            );
            if (campaignsWithScore.length !== user.campaigns.length) {
              console.error(
                "\x1b[33m%s\x1b[0m",
                "we did not get same number of campaigns back"
              );
            } else {
              console.info(
                "\x1b[36m%s\x1b[0m",
                "number of campaigns returned are same as what we gave in"
              );
            }
            const found = campaignsWithScore.every((cws) =>
              user.campaigns.find((x) => x.id === cws.id)
            );
            if (found) {
              console.info(
                "\x1b[36m%s\x1b[0m",
                "all returned campaigns exist on user"
              );
            } else {
              console.error(
                "\x1b[33m%s\x1b[0m",
                "some campaigns do NOT exist on user: ",
                user.campaigns,
                campaignsWithScore
              );
            }
          })
          .catch((err) => {
            console.error("\x1b[33m%s\x1b[0m", "got error while making call");
            console.log(err);
          });
        count = count + 1;
        if(count === MAX_COUNT){
          console.log("we have made 3 requets. will not make more");
          break;
        }
      }
    }
    if(count === MAX_COUNT){
      console.log("we have made MAX_COUNT requests. will not make more");
      break;
    }
  }
})();

export {};
