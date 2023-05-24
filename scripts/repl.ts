import prisma from "@/lib/prisma";
import { Prisma, Setting } from "@prisma/client";
import { subHours } from "date-fns";
import { User } from ".prisma/client";
import cookie from 'cookie';


(async () => {
  const userId: string = "clhtwckif000098wp207rs2fg";

  console.log("repl");
  const cookiesObj = cookie.parse('_ga=GA1.1.105692569.1650039073; __adroll_fpc=f2b4cdf1a7b87ae02438872b15c81484-1653495824446; __ar_v4=EXOXFG6LARD2NOUBJARY2P%3A20220524%3A382%7CGZ5J7FZYIZEDXGXPJLTCKM%3A20220524%3A382%7CYZNNZUXYUBHFJGKCS34ISR%3A20220524%3A382; _ga_LKHPPZL04T=GS1.1.1656025631.144.1.1656027599.0; _ga_X3E9X9F9VK=GS1.1.1663164178.1.1.1663165708.0.0.0; _ga_VY0EHD2WPX=GS1.1.1663164577.142.1.1663167727.0.0.0; intercom-id-vesl7md6=60f76296-7769-4d83-ba18-9a4ea13acdb2; intercom-device-id-vesl7md6=635305ea-fb76-49a3-b3ee-ad903f646040; _clck=1fhg78n|1|f7c|1; _ga_863WBM8EY7=GS1.1.1670865245.81.1.1670871062.0.0.0; __gads=ID=1d34f88fda462122:T=1678229374:S=ALNI_MZ5bFSzTtviAyTktsG3ONU72_z1Ig; __gpi=UID=0000057963d75d3c:T=1678229374:RT=1678488906:S=ALNI_Ma-Gx1muSdb8ujePLiFM-xH_7S0Nw; mp_3f95b2eb647e701c126fad3d28067132_mixpanel=%7B%22distinct_id%22%3A%20%221833c8a9b434e0-01b143d5fbd9fe-56510c16-1fa400-1833c8a9b44e61%22%2C%22%24device_id%22%3A%20%221833c8a9b434e0-01b143d5fbd9fe-56510c16-1fa400-1833c8a9b44e61%22%2C%22%24initial_referrer%22%3A%20%22http%3A%2F%2Flocalhost%3A3000%2F%22%2C%22%24initial_referring_domain%22%3A%20%22localhost%3A3000%22%2C%22wallet_address%22%3A%20%220x378a29135fdFE323414189f682b061fc64aDC0B3%22%2C%22injectedNetwork%22%3A%20%7B%22chainId%22%3A%2031337%2C%22name%22%3A%20%22unknown%22%7D%2C%22chainId%22%3A%2031337%7D')
  console.log(cookiesObj);

  const cookieHeaderString = cookie.serialize("foo", "bar", {
    domain: "foo.com",
    httpOnly: true,
    maxAge: 2147483647,
    path: "/",
    secure: true
  });
  console.log(cookieHeaderString);

})();

export {};
