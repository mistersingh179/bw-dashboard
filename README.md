# BW Dashboard

## Commands

- turn on the database `docker compose up`
- `npm run dev` to get local next server
- `npx prisma migrate dev` to run the migrations & build client
- `npx ts-node sample.ts` Prints users in Database
- `npx ts-node --transpile-only` the `--transpile-only` makes it so that it doesn't complain on TS issues
- for production / non dev usage we do `npm run build` & then use `npm start` to serve it 

## running arbitrary script
- `tsx scripts/foo.ts`
- `tsx watch scripts/foo.ts` for quicker iterations in dev
- or `npx ts-node scripts/foo.ts` but also requires `"module": "CommonJS"` set in tsconfig.json. this can be set just for `ts-node` by putting it in `"ts-node"` block.

## REPL like behavior with Editor
- build .ts file & run it with `ts watch`
- inside the file use `require.main === module` to detect that it was called directly
- when called directly run the module or function it exports

## regular generic REPL 
- use `prisma-repl --verbose`
- supports top line `await`, auto-complete 
- access prisma db object by variable `db` so query is like `await db.user.findMany()`

## Useful

- `http://localhost:3000/api/auth/providers` gives links of all providers we have

## SQL

- Drop database

```
select current_database();
select * from pg_stat_activity where datname='bw';
select pg_terminate_backend(3198);
SELECT datname FROM pg_database;
drop database bw;
```

## DB prisma & serverless neon setup
- `DATABASE_URL` is the pool url to connect to db
- `DIRECT_URL` is direct to db & used by migration command
- `SHADOW_DATABASE_URL` is a seperate db used by migrate command to first deploy there, compare with primary & then wipe out the shadow db
- using `connect_timeout` on the db connection string to specify how long prisma should wait before db is considered down
- by putting 0 it means never time out
- it takes time to come up in neon as the compute server is suspended on inactivity
- `pool_timeout` is the same for pooled connections
- `pgbouncer` so that it used to manage connections
- `prisma migrate` does not work with `pool` connections. so need to use direct db url.

## Deployments

- package.json has `vercel-build` task setup to build TS artifacts & deploy schema to database
- Vercel will use `vercel-build` when doing build for deployment

## DNS

- `dscacheutil -q host -a name app.brandweaver.ai` checks what ip comes back

## Postman
- to call authenticated API add cookie `next-auth.session-token` to the request
- value can be taken from the browser
- add it as a header with key `cookie` & value of `next-auth.session-token=12345`

## Pending backlog
- fix temp in websiteUrls/list.tsx
- sort optimistic data to match sort of backend data, this is to prevent flicker.
- setup redirect for index to list and index to show
- edit is showing spinner, it should show cached data 
- add indexes as needed in db
- setup prisma studio for production
- website url toggle not flipping immediately
- rename brand to product both be & fe
- ditch our types for prisma types for campaign
- look at await in map
- add reason to relevant campaign
- rename relevantCampaign to scoredCampaigns
- add types to service functions, so they can't be called wrong
- think on how may advertisements we need. currently it builds every time it is called.
- unique index on the many to many join table for websiteUrl, campaignId
- rename corpus to html
- take users threshold
- rename WebsiteUrl to Webpage & call join table WebpageCampaigns
- if we dont have 5 spots, lets get to 5 spots, but we dont want the same spots again, so maybe use index to prevent that insertion
- our createMany should not fail if one record fails to enter - `skipDuplicates`

## Pending immediate next thing
- show scoredCampaigns for our every url
- storing of entire page & before, after

## Pending Tasks
- automate website url creation from sitemap
- setting to bypass website url check
- status option on BW option
- for each url, see if any relevant campaign score is missing and if missing get them.

## Pending prompt research
- research if sending campaigns individually or with a group make a difference

## Pending nice to do
- make edit & create use separate forms rather than sharing one or merge typescript types on functions
- maintain cache of show, edit, create, separate from index, they 
- make index for to manage all middleware exports
- add validations to campaign form e.g. requiredCssSelector, url etc.

## Pending integration reserach
- scrapeops.io
- 

## Pending Feature's
- deploy prisma client

## Pending extension work
- multi select drop down list of advertiser.
- Brands Ranked by Relevance

## Pending script
- remove query params before checking url

## Notes on how services are working the background

1. User gives us their top level domain name(s).
2. We get that domains sitemap, and from that we save all of its urls.
3. For each `websiteUrl` we call `updateCorpus()` to get its html content.
4. Then for each `websiteUrl` we call `createRelevantCampaigns()` so we have campaigns with scores which can run when this website is loaded
5. Then for each `relevantCampaign` we call `createAdvertisements` so we have advertisement spots that campaign can run with before & after text.