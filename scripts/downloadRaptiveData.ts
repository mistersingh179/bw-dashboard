import Papa from "papaparse";
import fs from "fs";
import fetch from "node-fetch";
import { addDays, format, isBefore, parse } from "date-fns";
import { pick } from "lodash";

const result: any[] = [];

const authToken =
  "Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAxMDUxNSIsIm5hbWUiOiJSb2QiLCJlbWFpbCI6InJvZEBicmFuZHdlYXZlci1lbWFpbC5jb20iLCJ0eXBlIjoicHVibGlzaGVyIiwiYWNjZXNzIjoibGltaXRlZC1wYXJ0bmVyIiwicGljdHVyZVVybCI6bnVsbCwib2F1dGhQaWN0dXJlUHVsbGVkQXQiOm51bGwsImlhdCI6MTY5ODY5ODQ3OCwiZXhwIjoxNzAxMjkwNDc4fQ.ek6xRbhnA32jQMlXM6dOWVCKJta7O2a7qJ4ErrPSeWOq5pD0yAH4GqDpYgMRcg_elh-FcZVENU1RJ7W7B5V8ATgCTCyvrBTd5IY26yXkTQ5FIgeGP8k0AHf6dimf0-oVm7qQKHUW2zqkuUKtM4qUL6c8g2WGMFRX2nrr4Z3g1T_U1SAsmBIcrGNLID9DEhGH5RLhDhzRuQf_fCfD5kfD7MLPIjLVngEK5QLJz3oTwLrcaBwIMpCMQntJg4q-J2qzLrpHPLGSaAqwfiEcJpgGrZ9bByo-OUbOEECvAp_CKRaZv2xMyNeSH04KQMB44syFMLeaHhqG2Qhqppl4t0y-uQjSh5tv9JofX922Db2w68911abKl8EGUcE8SCPZ55z4nTAdm04ZNw3J68IHObC6-he1p6pCpTHPkxiVJOWq-SyZv0R_IrnfEOZ7UIx5Xz5-w6d5CGw09eyvWvajkNKRbiQFM0umNhH0l39c8EWuxY9az6Dr8RJsBRwgOvYIV2SDETQ9sP1Q8_l8BO6KsYRrkzSWQi0YmSKV9YOKHCJwUbQKHt0LK3xsLwNV-tQS6R4ekjWMpQXnOJF8QZS-_cf3V_8nRBa_CqsznxBchv0uwRNknJ-JIcJgdd6Y2n9_uo9vba8Me2Y-kuLzMUb7c1g7oKBQR7ouK_kx8al5OZwo7xk";

const getEngTime = async (formattedDate: string) => {
  const res = await fetch(
    `https://api.raptive.com/api/v2/sites/61d346d9037bcc001bcb7ada/traffic/aggregateStats/${formattedDate}/${formattedDate}`,
    {
      method: "GET",
      headers: {
        Authorization: authToken,
      },
    }
  );

  const ans = (await res.json()) as any;
  console.log(ans);
  return pick(ans.data, [
    "pageviewsPerSession",
    "bounceRate",
    "avgEngagementTime",
  ]);
};

const getEarnings = async (formattedDate: string) => {
  const res = await fetch(
    `https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/overview/${formattedDate}/${formattedDate}`,
    {
      method: "GET",
      headers: {
        Authorization: authToken,
      },
    }
  );

  const ans = (await res.json()) as any[];
  return ans[0];
};

const getImpressions = async (formattedDate: string): Promise<number> => {
  const res = await fetch(
    `https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/byAdUnit/${formattedDate}/${formattedDate}`,
    {
      method: "GET",
      headers: {
        Authorization: authToken,
      },
    }
  );
  const data = (await res.json()) as any;
  const impressions = data["all"].reduce(
    (accumulator: number, cv: any) => accumulator + cv.impressions,
    0
  );
  return impressions;
};

(async () => {
  console.log("hello world from downloadRaptiveData");

  const startingDate = parse("2023-08-01", "yyyy-MM-dd", new Date());
  const endingDate = parse("2023-10-30", "yyyy-MM-dd", new Date());

  let currentDate = startingDate;
  while (isBefore(currentDate, endingDate)) {
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    console.log("fetching for: ", formattedDate);

    let data = await getEarnings(formattedDate);

    const impressions = await getImpressions(formattedDate);
    data.impressions = impressions;

    const engTimeObj = await getEngTime(formattedDate);
    data = {...data, ...engTimeObj}

    result.push(data);
    currentDate = addDays(currentDate, 1);
  }

  const csv = Papa.unparse(result);
  console.log(csv);
  fs.writeFileSync("foo.csv", csv);
  console.log("*** finished ***");
})();

export {};
