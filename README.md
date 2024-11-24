# Croissant 🥐

A dashboard for your flaky tests, built on Cloudflare Workers and D1.

## Deploying

- Fork this repo.
- Run `npx wrangler d1 create croissant` and get the database ID
- Update `wrangler.toml` with your database ID. Note that you need to update it in two places in the file!
- Run `npm run build && npx wrangler deploy`

## Uploading test results

There's a GitHub Action you can use [here](https://github.com/taobojlen/croissant-action).

## Debugging

You can run `npx wrangler tail` to see live logs/errors from your deployment of Croissant.
