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

## Deployments

- package.json has `vercel-build` task setup to build TS artifacts & deploy schema to database
- Vercel will use `vercel-build` when doing build for deployment

## DNS

- `dscacheutil -q host -a name app.brandweaver.ai` checks what ip comes back