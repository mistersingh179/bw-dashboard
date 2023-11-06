# BW Dashboard

Tag Test

## Commands

- turn on the database `docker compose up`
- `npm run dev` to get local next server
- `npx prisma migrate dev` to run the migrations & build client
- `npx ts-node sample.ts` Prints users in Database
- `npx ts-node --transpile-only` the `--transpile-only` makes it so that it doesn't complain on TS issues
- for production / non dev usage we do `npm run build` & then use `npm start` to serve it
- run taskforce locally so taskforce UI can see our local redis
- `taskforce -n "Local Docker Redis" -p 63790 -t xxxxxxxxxxx`
- at times we need to run scripts locally and dont want logs so we can turn them off via env variables `PINO_LOG_LEVEL=error node --loader tsx scripts/repl.ts`
- rename iterm2 terminal tab title by `command + i` and then typing what we want

### Local Servers

```
lt --subdomain brandweaver-app-server --port 3000
lt --subdomain brandweaver-web-server --port 8000
lt --subdomain brandweaver-client-server --port 8000
```

and then env variables

```
BW_DASHBOARD_BASE_URL: '"https://brandweaver-app-server.loca.lt"',
BW_CDN_BASE_URL: '"https://brandweaver-web-server.loca.lt"',
BW_FEEDBACK_URL: '"https://brandweaver.ai/what-is-brandweaver-content-dev"'
```

## running arbitrary script

- `tsx scripts/foo.ts`
- `tsx watch scripts/foo.ts` for quicker iterations in dev
- or `npx ts-node scripts/foo.ts` but also requires `"module": "CommonJS"` set in tsconfig.json. this can be set just for `ts-node` by putting it in `"ts-node"` block.
- to run from webstorm create a new config called `tsx` and setup Node parameters to be `--loader tsx` and javascript file to `$FilePathRelativeToProjectRoot$`. this will basically do `node --loader tsx ./currentFile.ts` which runs the file. `Ctrl + r` will get the same.
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

# AB test code notes
- only do AB test we have tippy data
- send event after dice roll A (ON) or B (OFF)
- people never scroll, should be in both cohorts
- people bounce soon, will be in both cohorts
- immediate bouncers will be in neither

# fixing CLS for current inline tippies
- build them with max-height when the webpage is built ✅
  - don't build if target is in or above viewport ✅
- content spot's bottom should be bellow scroll ✅
- allow user to remove them ✅
- remove skip, show & hide ✅
  - hide all or just this one ⁉️
  - hide for this session or persist ⁉️
- put content inside of para rather than after it. this will prevent ads pushing us away ✅
  - should we need to compenate for padding which is inside the para now? ⁉️
- fade in content when tippy enters viewport ✅
  - when to start, and how much to fade ✅ ⁉️
  - showing item even at the bottom portion, not just top ✅ 
  - should it be when box is 100% visible or 50% or to the top of page etc. ✅
- if google bring them in, then they are not on the top of the page, are they? ⁉️
  - need to check. ⁉️
- be compatible to run with async or blocking ✅
  - should run when loaded before dom exists ✅
  - should run when loaded after dom exists ✅
- build tooltips sooner ✅
- fix GA events ✅
  - remove not needed events ✅
  - add our events ✅
- confirm that loading content above is not causing CLS ✅
  - append when above viewport ✅
  - confirm that it can fade in when scrolling up and it comes in to view ✅
- fix all logs
- undo auction fetch request ✅
- try and rebuild on scroll for things out of viewport  ✅
  - should cause no CLS  ✅
  - should only build what is missing  ✅
  - should have debounce ✅
- check new design of append over after works for all clients ✅
- build tippies on first hit ✅
- 
# Options to Solve CLS
- some tips on working with CLS – https://bitspeicher.blog/core-web-vitals-guide-cls/
- showing tippies on load will cause CLS as our content suddenly appears after the page has loaded.
- showing tippies on scroll will cause CLS for the same reason.
- adding tippies to existing content also does not solve CLS as their height is not fixed and this causes layout to shift
- using an ease transition helps but not a lot. 0.069 vs 0.087
- **button** solution – we add a button which the user clicks to see our tippies.
- **placeholder** solution – the publisher is to have boxes where they want tippies with fixed height pre-defined
  - and then we just add our content to these boxes
  - here we can also use transform to fill up that space
  - this won't cause any layout shift as the box was already there with the space.
- **on-load** solution – have our content build on-load at the bottom out of the viewable space
  - this relies on the user not navigating to the bottom and making our content visible before we showed it
  - we can also write code to only show tippies when not in view
    - so we check before showing are we in view. if no, only then show it
- **hover-bottom/top** solution – put our content over existing content
  - content starts by showing at the bottom
  - we show tippy for next para as the original para moves out of view 
  - at any time only 1 tippy is being shown
- **bottom-rail** solution - take fixed space at bottom on top of existing content
  - this causes 0 cls
  - we put margin-bottom on exisitng content equal to the size of bottom rail
  - this allows it to scroll out of view
  - also 0 CLS even though we are added after page has loaded
- **hover-fixed-bottom/top-position** solution – we show the tippy at a fixed position on the bottom for content they are reading
  - it is like the desktop hover solution but rather than taking space on the right, we take it at the bottom
  - it is also like the bottom rail solution, but this shows / hides whereas bottom-rail stays.
  - same as bottom rail 0 CLS even though we show and hide later as user is scrolling the page
## narrowed down list
- fixed position top
  - transition opacity in as user scrolls in
    - take first 300 pixels of scroll to bring its opacity from 0 to 1
  - it has all the tooltips loaded in it
  - we scroll it to show the tooltip of the paragraph closest to it
  - when the closest paragraph has no tippy, we scroll to bottom where it says reached end of tippies
  - it has built in fixed ad 350x50
  - it has ad inside content, between each tippy.
  - auto expand our box when the user scrolls
  - 
## cls experiments
  - how long does it take for a scroll after we have loaded & can manipulate the dom
## cls question
  - they may scroll accidenly inside the tippies early
    - should we disable scroll
  - place holder text which shows up when we have no para being read
    - this explains who we are and what this space is about
  - query what phone height do people have, where will we be
  - what is scroll position when our script loads
## cls recorded
  - script **with defer**, adding in viewport after image – 0.774
  - script **without defer** adding in viewport after image – 0.132

# explore
- how to use facts of the website when generating tippy
- email summary
- content recommendation 
  - inline
  - worded by us
- finding related article?

# raptive numbers
- for each day i want page-views, impressions, impressions PER page-views, avg engagement time, cpm
- and then we see correlation between avg engagement time & impressions per page-views

earnings 
  -> https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/earnings/2023-09-08/2023-09-08
earnings, rps, sessions
  –> https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/rps/2023-09-08/2023-09-08?
pageviews, earnings, sessions, avgTimeOnPage, rpm, rps
  –> https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/overview/2023-09-08/2023-09-08?
per ad unit we get ecpm, earnings, impressions
  –> https://api.raptive.com/sites/61d346d9037bcc001bcb7ada/earnings/byAdUnit/2023-09-08/2023-09-08?
avg engagement time
  -> https://api.raptive.com/api/v2/sites/61d346d9037bcc001bcb7ada/traffic/aggregateStats/2023-09-08?


# Pending Meta Content
- setup clinic.js
- record AB test data
- build new queries
- datadog query for slowness
- allow storing of manually rejected meta content
- add ability to abort on pages which match a path like we do for categories
- send logger throughout so we track entire generate auction
- does cache delay ad building, why no ads?
- exlucde IP's from AB split
- post comit to clear cache
- add GTAG to dashboard
- allow rod to bypass AB test
- fix height issue on restoration media
- check website name without checking for http and https
- updgrade prisma & see if it fixes the `none: {}` issue
  - fix process wp with zero ads  
- process webpages in real-time
- google chrome issue
  - https://app.brandweaver.ai/inline-tooltip/crosswalk-parenting.html

## Notes

- daily job downloads latest pages & only processes them
- so if something failed downstrea yesterday, but was added yesterday, then it won't be processed today

## Pending issues

- record time on site for only when on site
- delete all old time on site
- query of time on site random between people, should be balanced
- 
- keyword ignore list for pages to be run on
- keyword must be present list for pages to be run on
- check ctr on more stories
- take title & description instead of content when scoring campaigns
- paginate scoring of campaigns
  - if too many campaigns this will currently fail
  - if html input is too large this will currently fail
- amazon affaliates api to get campaigns
- track if impression was in viewable space
  - if its below fold, or hidden in a modal etc.
- generate message should tell us that webpage not found instead of saying status is off
- show reporting per campaign
- show reporting per webpage
- add webpage url search

## Pending dev ops

- auto set title name when cd into appropriate directory
- try prisma cloud with a new db and then with json schema format
- bail on building inline tooltip if it is inside column flex box as this would put us in a column 
- grant users computer super-power so we can show buttons inside other accounts which require super access
- fix dev worker to auto reload when any jobs or services change
- make database show time in est

## Pending backlog

- create all webpages as OFF
- search filter on webpages page
- immediate webpage job process them when webpage is toggled on / "Process Webpage"
- update the scrape settings
- delete advertisement spots
- re-run process webpage
- function to turn on all webpages (internal function)
- look at not cascading deletes to auction & impression
- owner dark/light theme from the os
- organize logs so they can be seen better in betterstack logging tool
- look at affaliate ads in email
- refactor auction generate api endpoint to have getAdsToShow which finds best campaign, gets its ads, and build ads if missing.
- run nightly job to show how many pages are matched.
  - this would change if you add/remove campaigns
  - also would change if you change user threshold score
- the `WILL SHOW` column on advertisements is not taking into account the impression cap of campaign
- adSpot maker is using user provided css selector get beforeText elements but front end is only checking paras.
  - this means if ad spot was latching on divs, we would not get it.
  - we should scan all or exactly the same as backend.
- create a child logger via middleware, add it to request object so that all downstream services can use that
  - this way in auctions generate we create logger
  - then impression count service called from it can use that logger

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
- download all webpages with lastMod, then process only the ones which are recent.

## Pending later things

- refresh data
  - fetch html of existing html pages which have changed ??
  - update the lastModifiedAt of Webpage, currently limited as the createMany does not have on conflict update option
  - fetch newer webpages of existing websites
  - fetch webpages of new websites
- make edit & create use separate forms rather than sharing one or merge typescript types on functions
- make index for to manage all middleware exports
- setup wild card for categories on a campaign. this enables a campaign to run on all categories
  - need to also support pages which have no categories
- improve ad spots code to be able to build them for categories page & home page

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

## gotchas
- don't put a semi-colon at the end of a redis command