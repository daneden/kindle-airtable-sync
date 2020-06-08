# Kindle Highlights to Airtable Sync

This little JavaScript utility syncs your Kindle Highlights to a specified Airtable base.

## Instructions

1. **Create an Airtable base with the following fields:**
   | name | type |
   |======|======|
   | title | `string` |
   | author | `string` |
   | note | `string` |
   | date | `string (ISO 8601 formatted date)` |
   | pageNumber | `number` |
   | locStart | `number` |
   | locEnd | `number` |
2. **Populate `.env` file.** Copy the `.env.example` file to `.env` and replace the placeholder values. If you plug your Kindle into your Mac, you’ll find your clippings at `/Volumes/Kindle/documents/My Clippings.txt`
3. **Run `yarn install`** to install dependencies.
4. **Run `yarn start` to run.**

## Known Issues/Caveats

- This has only been tested on a relatively small clippings file so there are almost definitely edge cases I haven't caught yet.
- Sometimes the regex used to parse the metadata may fail, causing the record creation to fail altogether
- There's no deduplication that happens (yet), so subsequent runs may create identical records
