# BW Dashboard

## Commands

- turn on the database `docker compose up`
- `npm run dev` to get local next server
- `npx prisma migrate dev` to run the migrations & build client
- `npx ts-node sample.ts` Prints users in Database
- `npx ts-node --transpile-only` the `--transpile-only` makes it so that it doesn't complain on TS issues
- for production / non dev usage we do `npm run build` & then use `npm start` to serve it 

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

- move delay in ajax calls out to common place
- think and refactor if should dates be kept as dates over string, and if dates can be over datetime in db
- loading, disabled, enabled & toast after create or edit
- add middleware for sleep
- login error: `Try signing in with a different account`
- refactor toast calls to reusable code
- refactor on edit, we need to refetch show as well

## Pending nice to do
- make edit & create use separate forms rather than sharing one
- maintain cache of show, edit, create, separate from index, they 
- make index for to manage all middleware exports

## Pending Feature's
- deploy prisma client

## extension todo
- multi select drop down list of advertiser.
- Brands Ranked by Relevance