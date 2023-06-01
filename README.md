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
- to run from webstorm create a new config called `tsx` and setup Node parameters to be `--loader tsx` and javascript file to `$FilePathRelativeToProjectRoot$`. this will basically do `node --loader ts ./currentFile.ts` which runs the file.  `Ctrl + r` will get the same.
- to run in watch mode from repl we can use node v19 and then the `--watch option` along with the `--loader tsx` option. 

## Webstorm
- run configs can be stored in directory `.run`, but do not exclude this directory or webstorm won't pick it up.
- also adding it to git will make sure other devs also get the same run configuration.

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

## URL's

- Prisma studio: https://cloud.prisma.io/mistersingh179/gold-lion-vrfjsebfou/production/databrowser

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

## Prisma Queries
- it will honor the order in which you specify the `where` keys. this can be helpful to match the indexes

## Deployments

- package.json has `vercel-build` task setup to build TS artifacts & deploy schema to database
- Vercel will use `vercel-build` when doing build for deployment

## DNS

- `dscacheutil -q host -a name app.brandweaver.ai` checks what ip comes back

## Postman
- to call authenticated API add cookie `next-auth.session-token` to the request
- value can be taken from the browser
- add it as a header with key `cookie` & value of `next-auth.session-token=81f3db43-b3fb-4a85-8507-bee316db9ae2`

## Pending - background job strategy
- add bullmq and deploy app to aws
- ass sqs consumer and deploy app to aws
- use defer.run
- render, heroku etc.

## Pending backlog
- create all webpages as OFF
- search filter on webpages page
- immediate webpage job process them when webpage is toggled on / "Process Webpage"
- update the scrape settings
- delete advertisement spots
- re-run process webpage
- function to turn on all webpages (internal function)

## Pending callback
- when a campaign is added, we need to build scores & then advertisements
- when a webpage is added, we need to get content, build spots & then advertisements 

## Pending – Next Up
- run jobs on cloud
- dashboard api for auctions, impressions & revenue count
- dashboard api for auctions, impressions & revenue change over yesterday
- dashboard chart api for auctions, impressions & revenue chart
- founders shop page to log in as customers & troubleshoot
- generate fp in front-end script
- rate limit on ip, fp, userid, enduser-cuid

## Pending Tasks
- see impact of allowing `{...req.body}` in update. can userId be provided to update wrong user, fix it if so.
- extend NextAuth user with the date fields 
- move constants to be per user in to its own table, add approve to it & onlyFounders middleware
- show auctions with impressions count
- show impressions
- write top level job which spits out other jobs for smaller things
- should we do mass insert of webpages rather than 1 at a time
- if we design onboarding insertion to happen together then we don't need to insert & then read and thus don't need indexes fo this read as they are not the same as when we do impressions

## Pending later things
- refresh data
  - fetch html of existing html pages which have changed ??
  - update the lastModifiedAt of Webpage, currently limited as the createMany does not have on conflict update option
  - fetch newer webpages of existing websites
  - fetch webpages of new websites
- make edit & create use separate forms rather than sharing one or merge typescript types on functions
- make index for to manage all middleware exports
- add validations to campaign form e.g. requiredCssSelector, url etc.
- setup wild card for categories on a campaign. this enables a campaign to run on all categories
  - need to also support pages which have no categories

## Pending – improve advertisements page
- allow editing advertisement text
- allow linking/disliking advertisement
- show all advertisements
  - show ones running
  - change threshold and see running ads going up/down
  - add/remove categories on a campaign and see running ads go up/down

## Pending prompt research
- research if sending campaigns individually or with a group make a difference
- how many tokens do we need for an average request

## Pending integration reserach
- scrapeops.io
- fingerprint.com

## Pending extension work
- multi select drop down list of advertiser.
- Brands Ranked by Relevance

## Pending script
- remove query params before checking url

## Pending performance
- refactor jobs
  - have 1 onboard job which we run only when onboard a website, i.e. a website is created
  - we can automate 5 days of webpages in onboarding and admin can onboard more
  - this does mass insert in bulks
  - then daily we only see delta of new webpages & just insert them individually
  - insert each new webpage individually will be cleaner as we are not doing old missed or unprocessable stuff again.
- will try to get ad spots when page doesn't have enough.
- it doesn't know we don't have enough cause its page fault & not our service issue
- should we parse webpage if it already has categories
- remove html from the webpage table, no point sending it down
- the part in process user which calls a third party api like chat gpt or http fetch can be parallelized
- only process those ad spots which dont have an advertisement for every scored campaign.
- going through all webpages without html is slow. need an index here. but adding just an index doesn't work as index is too large
- mark pages for whom we can't get spots, and now they sit to be processed again when we run and most likely we won't get spots again unless either our logic changes or their content changes
- think on how to prevent processing a website, because it fetches its sitemap which is slow and we don't want to fetch it repeatedly. our db is protected as it will just conflict and not insert.
- put redis cache in front of repeated static repeated queries in advertisement lookup api
- only send webpages to createAdvertisement service, which don't have enough advertisements

## Pending - Reduce scored campaigns
- user has categories
- categories are build as process webpages (upsert)
- campaign belongs to category or none. no cascade delete
- webpages also belong to category or none. no cascade delete
- for every webpage, get all campaigns with same category and build scored campaigns
- don't build scored campaign if already there.
- when request comes in we will get webpage -> scoredCampaigns -> campaigns (filter campaigns whose category is not blank and is not same as that of webpage).

## Notes on how services are working the background

1. User gives us their top level domain name(s).
2. We get that domains sitemap, and from that we save all of its urls.
3. For each `websiteUrl` we call `updateCorpus()` to get its html content.
4. Then for each `websiteUrl` we call `createRelevantCampaigns()` so we have campaigns with scores which can run when this website is loaded
5. Then for each `relevantCampaign` we call `createAdvertisements` so we have advertisement spots that campaign can run with before & after text.

## Notes on how we handle requests from the script
- Script 1st makes POST call to generate an auction
- it gives us userId, url, fp & cuid cookie
- we save the auction & return back auction id
- we also attempt to find advertisements which can be shown & return potential ads back
- we also set cuid cookie
- Now Script attempts to display those advertisements
- Script makes 2nd call POST for each impression to record that impression
- it gives us userId, auctionId & advertisementId
- we save impression & return back id
- Script makes 3rd call POST for each click on that impression
- it gives us just impressionId