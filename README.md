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

## Pending backlog
- look in to prefetching using useSWR
- on webpage detail show counts of spots & advertisements
- setup pattern for api to disclose the return type to be prisma object nested inside a superjson result
- design improvement to reduce scored campaigns
  - user has categories
  - categories are build as process webpages (upsert)
  - campaign belongs to category or none. no cascade delete
  - webpages also belong to category or none. no cascade delete
  - for every webpage, get all campaigns with same category and build scored campaigns
  - don't build scored campaign if already there.
  - when request comes in we will get webpage -> scoredCampaigns -> campaigns (filter campaigns whose category is not blank and is not same as that of webpage).
- paginate webpages and setup pattern for all pagination 
- backend should reject api calls from front end where params are undefined.
- we need page's category & a category selection on campaign
- shall we score all campaigns or only ones which match category
- on webpage's detail page show its category & the campaigns category showing that it won't run
- show campaigns of matching category separate from campaigns which are not matching
- how can we support campaign which can run on multiple categories
- the part in process user which calls a third party api like chat gpt or http fetch can be parallelized
- only process those ad spots which dont have an advertisement for every scored campaign.
  - it is anyways building the advertisement seperately for each scored campaignso we can call it individually
- going through all webpages without html is slow. need an index here. but adding just an index doesn't work as index is too large
- change from cuid to autoincrement

## Pending immediate next thing/feature 
- show scoredCampaigns for our every url
- storing of entire page & before, after
- gray out advertisements which are not going to run
- campaign is out of date range
- campaign is paused
- campaign category is different from webpage category
- allow editing advertisement text
- allow linking/dislinking advertisement

## Pending Tasks
- on a webpage, show impact of threshold to matched campaigns
- automate website url creation from sitemap
- setting to bypass website url check
- status option on BW option
- for each url, see if any relevant campaign score is missing and if missing get them.
- ui to show ad spots, ads & relevant campaigns for the url
- allow user to enter top level urls
- allow user to set threshold
- use threshold when picking relevant campaigns for showing
- use threshold when picking relevant campaigns for building ads 
- add TopLevelDomains table & move pages under it
- add middleware to check referrer
- add middleware to rate limit by ip, fp, cookie etc.
- add page for founders to log in as customer & troubleshoot
- revisit indexes after doing front end auction/impresssion creation/insertion
- revisit indexes after doing pacing
- see impact of allowing `{...req.body}` in update. can userId be provided to update wrong user, fix it if so.
- extend NextAuth user with the date fields 
- what happens if an advertisement wins which belongs to an ad spot which doesn't exist as the page has changed
- move constants to be per user in to its own table, add approve to it & onlyFounders middleware
- update relation mappings for auctions
- store auctions
- show auctions
- think on how to prevent processing a website, because it fetches its sitemap which is slow and we don't want to fetch it repeatedly. our db is protected as it will just conflict and not insert.
- write top level job which spits out other jobs for smaller things
- should we do mass insert of webpages rather than 1 at a time
- re-do services to accept objects over id after confirming that we can serialize the object in the message
- if we design onboarding insertion to happen together then we don't need to insert & then read and thus don't need indexes fo this read as they are not the same as when we do impressions
- mark pages for whom we can't get spots, and now they sit to be processed again when we run and most likely we won't get spots again unless either our logic changes or their content changes

## Pending prompt research
- research if sending campaigns individually or with a group make a difference
- how many tokens do we need for an average request

## Pending nice to do
- make edit & create use separate forms rather than sharing one or merge typescript types on functions
- maintain cache of show, edit, create, separate from index, they 
- make index for to manage all middleware exports
- add validations to campaign form e.g. requiredCssSelector, url etc.
- make site have many sitemaps. if entered sitemap has urls, save them. if entered sitemap has more sitemaps, then add  their underlying sitemap in with false status.

## Pending integration reserach
- scrapeops.io
- fingerprint.com

## Pending Feature's
- deploy prisma client

## Pending extension work
- multi select drop down list of advertiser.
- Brands Ranked by Relevance

## Pending script
- remove query params before checking url

## Pending performance
- will try to get ad spots when page doesn't have enough.
- it doesn't know we don't have enough cause its page fault & not our service issue

## Pending later things
- refresh data
  - fetch html of existing html pages which have changed ??
  - update the lastModifiedAt of Webpage, currently limited as the createMany does not have on conflict update option
  - fetch newer webpages of existing websites
  - fetch webpages of new websites
  -



## Notes on how services are working the background

1. User gives us their top level domain name(s).
2. We get that domains sitemap, and from that we save all of its urls.
3. For each `websiteUrl` we call `updateCorpus()` to get its html content.
4. Then for each `websiteUrl` we call `createRelevantCampaigns()` so we have campaigns with scores which can run when this website is loaded
5. Then for each `relevantCampaign` we call `createAdvertisements` so we have advertisement spots that campaign can run with before & after text.