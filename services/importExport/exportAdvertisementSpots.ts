import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import fs from "fs";
import Papa from "papaparse";

const myLogger = logger.child({name: "exportAdvertisementSpots"});

type ExportAdvertisementSpots = (userId: string) => Promise<void>;

const exportAdvertisementSpots: ExportAdvertisementSpots = async (userId) => {
  myLogger.info({}, "inside service");
  const spots = await prisma.advertisementSpot.findMany({
    where: {
      webpage: {
        website: {
         userId
        }
      }
    },
    include: {
      webpage: true
    }
  });
  console.log("spots: ", spots);
  let data = []
  for(const spot of spots){
    const spotText = spot.beforeText.split(" \n ").slice(-1)[0];
    const url = spot.webpage.url;
    data.push({
      url,
      spotText,
    });
  }
  const csv = Papa.unparse(data, {
    quotes: false,
  })

  console.log(csv);
  fs.writeFileSync(
    "services/importExport/adSpots.csv",
    csv,
    {}
  );
};

export default exportAdvertisementSpots;

if (require.main === module) {
  (async () => {
    await exportAdvertisementSpots("climifncr00wgme08z6uyo3bg");
  })();
}
