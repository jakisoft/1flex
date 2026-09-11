# 1Flex Multi-Source Scraper & Streaming CLI

A high-performance Node.js scraper, reverse-engineered API client, and CLI for `https://www.1flex.org`. Built with zero external dependencies and reverse-engineered directly from 1Flex Next.js production client bundles.

## Features

- **Media Catalogs**: Scrape trending, popular, top rated, upcoming, and now playing movies and TV shows from 1Flex backend (`db.1flex.org`).
- **Complete Media Details**: Scrape full metadata, cast & crew credits, official trailers/videos, posters, backdrops, and seasons/episodes.
- **8 Dynamic Video Embed Providers**: Resolves streaming links for all 8 providers (`MAIN_1` Viduki, `MAIN_2` Vidy, `MAIN_3` Vidfast, `MAIN_4` Vidlink, `MAIN_5` Vidrock, `MAIN_6` Vidzee, `MULTILANGUAGE`, `PREMIUM_EMBEDS`), plus 9 Vidfast fallback mirrors and Subscene subtitle lookups.
- **Live Sports Engine**: Scrape live matches, fixtures, today matches, all events, sports categories, and live stream embed feeds (`admin`, `echo`, `delta`, `golf`) with team badges and event posters.
- **Global Live TV Scraper**: Scrape global television channels across countries, parse M3U playlists, and extract direct HLS `.m3u8` stream URLs.
- **Web Games Catalog**: Scrape Selenite browser games library with directory links, tags, thumbnails, and direct playable URLs.
- **Multi-Tracker Torrent Search**: Scrape torrents and magnet links with seeders, leechers, file sizes, and upload dates across 4 major indexers (`yts`, `piratebay`, `1337x`, `nyaasi`).
- **Discovery & Enhanced Search**: Filter by language, genre, year, and relevance scoring matching 1Flex client algorithms.
- **Views Tracking**: Check real-time view counts and increment views for movies and series episodes.
- **Clean JSON Output**: Pure JSON stdout output suitable for piping to `jq` or file persistence with `--save`.

## Quick Start

```bash
cd /root/1flex

node main.js --health

node main.js --trending --type movie --window week

node main.js --movies --filter popular

node main.js --tv --filter popular

node main.js --details 550 --type movie

node main.js --stream 550 --type movie

node main.js --season 1 --id 66732

node main.js --sports --filter live

node main.js --sports --filter categories

node main.js --live-tv --country us

node main.js --games mario

node main.js --torrent batman --provider yts

node main.js --search "Interstellar" --type movie
```

## CLI Reference

| Option | Description |
| --- | --- |
| `--health`, `-h` | Check health and latency of all endpoints |
| `--trending` | Scrape trending content |
| `--movies` | Scrape movies catalog (`--filter popular\|top_rated\|upcoming\|now_playing`) |
| `--tv` | Scrape TV shows catalog (`--filter popular\|top_rated\|airing_today\|on_the_air`) |
| `--details <id>` | Scrape full metadata for a movie or TV show |
| `--season <num>` | Scrape TV season episodes (requires `--id <tv_id>`) |
| `--credits <id>` | Scrape cast and crew credits |
| `--videos <id>` | Scrape official trailers and clips |
| `--images <id>` | Scrape posters, backdrops, and logos |
| `--person <id>` | Scrape actor/director profile and filmography |
| `--genres` | Scrape list of genres for movies or TV |
| `--discover` | Discover content by genre, language, year, or sort order |
| `--search <query>` | Search catalog (`--type multi\|enhanced\|movie\|tv\|person`) |
| `--views <id>` | Retrieve or increment views count (`--inc`) |
| `--stream <id>` | Scrape resolved video embed stream URLs for all 8 providers |
| `--providers` | Fetch active dynamic embed providers |
| `--sports` | Scrape sports events (`--filter live\|today\|all\|categories`) |
| `--sports-stream` | Scrape live sports stream feed (`--source <src> --match-id <id>`) |
| `--live-tv` | Scrape live television channels (`--country <code>` or `--countries`) |
| `--games` | Scrape browser games catalog (`--search <query> --tag <tag>`) |
| `--torrent <query>` | Search torrents (`--provider piratebay\|1337x\|yts\|nyaasi`) |
| `--type <type>` | Specify media type (`movie`, `tv`, `all`, `person`) |
| `--country <code>` | Specify ISO country code for Live TV (default: `us`) |
| `--provider <name>` | Torrent indexer: `yts`, `piratebay`, `1337x`, `nyaasi` |
| `--save <file>` | Save JSON output directly to file |
| `--quiet`, `-q` | Silence progress logs from stderr |
| `--help` | Show CLI help manual |

## Programmatic API

```javascript
import { OneFlex } from './lib/1flex.js';

const client = new OneFlex();

const trending = await client.getTrending('all', 'day');

const streams = await client.getStreamSources({
  id: 550,
  type: 'movie'
});

const matches = await client.getMatches('live');

const channels = await client.getCountryStreams('us');

const torrents = await client.searchTorrents('matrix', 'yts');

const games = await client.getGames('mario');
```
