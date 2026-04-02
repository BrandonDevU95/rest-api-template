# Project Naming Mini Guide

Use this guide to rename the template in a few minutes without searching the codebase.

## What to edit

1. `.env`

## Rename checklist

1. Open `.env` and change these values:
   - `PROJECT_SLUG`
2. Update database and seed defaults in `.env` if you want the sample values to match your new project name.
3. Run `npm run naming:sync` to update `package.json` and `package-lock.json` from `PROJECT_SLUG`.
4. Run `docker compose up --build`.
5. If you changed `.env`, restart the containers so Docker picks up the new names.

## What each name affects

| Value | Affects |
| --- | --- |
| `PROJECT_SLUG` | Docker Compose project name, API/MySQL/phpMyAdmin container names, shared network name, app name (logs/Swagger title), Swagger description, package name, and package description |

## Result

After these changes, the project identity is updated in one place instead of being scattered across folders.