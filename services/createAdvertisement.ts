import { AdvertisementSpot } from "@prisma/client";
import prisma from "@/lib/prisma";

const createAdvertisement = async (advertisementSpot: AdvertisementSpot) => {
  console.log("will create advertisement(s) for spot: ", advertisementSpot);
  // todo – call chatGpt here
  // we can get before & after from the spot
  // and the html corpus from the spot's url object
  // and the brand name & description for every scored campaign this url is connected to
  // ignore building advertisments for any campaign for whom we already have advertisements
};

export default createAdvertisement;

if (require.main === module) {
  (async () => {
    const advertSpot = await prisma.advertisementSpot.findFirstOrThrow();
    await createAdvertisement(advertSpot);
  })();
}
