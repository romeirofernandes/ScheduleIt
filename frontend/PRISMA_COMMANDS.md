# Prisma Commands Guide

This file contains the common Prisma commands you might need while working on the ScheduleIt project.

> [!WARNING]
> **Always run these commands from inside the `frontend` folder!** 
> If you run them in the root `ScheduleIt` folder, Prisma won't be able to find your `.env` or `prisma.config.ts` files. Run `cd frontend` first.

## Initialization & Setup

### `npx prisma generate`
**When to use:** Run this after doing an `npm install`, pulling changes from Git, or whenever you modify `prisma/schema.prisma`.
**Description:** Reads your `schema.prisma` file and generates the Prisma Client (`@prisma/client`) tailored to your models. This gives you auto-completion and types in your code.

## Migrations (Database Schema Changes)

### `npx prisma migrate dev --name <migration_name>`
**When to use:** Run this when you have made a change to `prisma/schema.prisma` (like adding a new model, field, or updating an enum) and you want to lock it in and apply it to your database.
**Description:** Creates a new SQL migration file in `prisma/migrations` and automatically applies it to your local database. It also automatically triggers `prisma generate`.
*Example: `npx prisma migrate dev --name add_user_profile`*

### `npx prisma migrate reset`
**When to use:** Run this if your local database becomes out of sync or if you want to completely wipe your database and re-apply all migrations from scratch.
**Description:** Drops the database, creates a new one, runs all migrations, and then runs the seed script (`prisma/seed.js`). **WARNING: This deletes all data.**

## Rapid Prototyping (Alternative to Migrations)

### `npx prisma db push`
**When to use:** Run this during early active development when you are tweaking the schema frequently and don't want to create lots of small migration files.
**Description:** Pushes the state of your `schema.prisma` directly to the database without generating migration files. **Note:** Generally, you should stick to `prisma migrate dev` once the application reaches production or involves multiple developers.

## Data Exploration

### `npx prisma studio`
**When to use:** Run this when you want to view, add, or edit data in your database using a graphical interface.
**Description:** Starts a local web server (usually at `http://localhost:5555`) with a GUI to interact with your database tables.

> [!CAUTION]
> **Azure PostgreSQL + Prisma 7.5+ Bug:** If you see "Could not load schema metadata", it's a known Prisma regression ([#29348](https://github.com/prisma/prisma/issues/29348)). The `uselibpqcompat=true` parameter in `DATABASE_URL` breaks Studio's introspection query in v7.5+.
>
> **Use this command instead** (pass the Studio-safe URL directly):
> ```
> npx prisma studio --url "$env:STUDIO_DATABASE_URL"
> ```
> Or paste the URL from `STUDIO_DATABASE_URL` in your `.env` file directly after `--url`.

## Seeding Data

### `npm run seed` (or `npx prisma db seed`)
**When to use:** Run this when you want to populate your database with initial or dummy data (like test users and default lab allocations).
**Description:** Executes the `prisma/seed.js` script to insert data into the database. Note that the seed script we built deletes existing data first to ensure a clean slate.
