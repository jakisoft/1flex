import fs from 'node:fs';
import path from 'node:path';
import { OneFlex } from './lib/1flex.js';

process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') {
    process.exit(0);
  }
});

function printHelp() {
  process.stderr.write(`
======================================================
  1FLEX.ORG MULTI-SOURCE SCRAPER & STREAMING CLI
  Platform: Node.js (Zero-Browser API & Content Engine)
  Output: Clean JSON Final Result to stdout
======================================================

Usage:
  node main.js [command] [options]

Commands:
  --health, -h              Run system & all service endpoint health checks
  --trending                Scrape trending movies and TV shows
  --movies                  Scrape movie catalogs
  --tv                      Scrape TV series catalogs
  --details <id>            Scrape full details for a movie or TV series
  --season <num>            Scrape TV season episodes (requires --id <tv_id>)
  --credits <id>            Scrape full cast and crew credits
  --videos <id>             Scrape official trailers, teasers, and clips
  --images <id>             Scrape posters, backdrops, and logos
  --person <id>             Scrape actor/director biography and media credits
  --genres                  List available genres
  --discover                Discover content with custom filters
  --search <query>          Search across movies, TV series, actors, and directors
  --views <id>              Check views count for a movie or TV episode
  --stream <id>             Scrape embed streaming sources from all 8 providers
  --providers               List active dynamic video embed providers
  --sports                  Scrape live sports matches, fixtures, and events
  --sports-stream           Scrape live sports stream feeds
  --live-tv                 Scrape global live television channels and M3U8 streams
  --games                   Scrape web games library with direct launch URLs
  --torrent <query>         Search torrents & magnets across 4 indexers
  --watchlist <userId>      Scrape user saved watchlist
  --ratings <userId>        Scrape user ratings

Options:
  --type <movie|tv|all>     Media type (default: movie or all)
  --window <day|week>       Trending time window (default: day)
  --filter <name>           Catalog filter (e.g. popular, top_rated, upcoming, live, today)
  --category <name>         Sports or genre category filter
  --popular                 Filter for popular sports events
  --source <name>           Sports stream source (e.g. admin, echo, delta)
  --match-id <id>           Match ID for sports stream
  --id <id>                 Media ID (used with --season, --credits, etc.)
  --season-num <num>        Season number for TV episodes
  --episode <num>           Episode number for TV stream or views
  --country <code>          Country code for Live TV (default: us)
  --countries               List all supported countries for Live TV
  --tag <tag>               Filter games by tag
  --game-id <dir>           Lookup specific game by directory name
  --provider <name>         Torrent provider: piratebay, 1337x, yts, nyaasi (default: yts)
  --query <string>          Search query for search, games, or live-tv
  --lang <code>             Language code for discovery (default: en)
  --sort <field>            Sort field for discovery (default: popularity.desc)
  --genre <id>              Genre ID for discovery
  --year <year>             Release year for discovery
  --page <num>              Results page number (default: 1)
  --inc                     Increment view count when using --views
  --title <str>             Media title (used for subtitle lookups)
  --save <file>             Save final JSON result to file
  --quiet, -q               Suppress progress logs from stderr
  --help                    Show this help message
\n`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    action: null,
    type: 'movie',
    window: 'day',
    filter: 'popular',
    category: null,
    popular: false,
    source: null,
    matchId: null,
    id: null,
    season: 1,
    episode: 1,
    country: 'us',
    countries: false,
    tag: null,
    gameId: null,
    provider: 'yts',
    lang: 'en',
    sort: 'popularity.desc',
    genre: null,
    year: null,
    page: 1,
    inc: false,
    query: '',
    title: '',
    save: null,
    quiet: false
  };

  if (args.length === 0) {
    options.action = 'health';
    return options;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (arg === '--health' || arg === '-h') {
      options.action = 'health';
    } else if (arg === '--trending') {
      options.action = 'trending';
    } else if (arg === '--movies') {
      options.action = 'movies';
      options.type = 'movie';
    } else if (arg === '--tv') {
      options.action = 'tv';
      options.type = 'tv';
    } else if (arg === '--details') {
      options.action = 'details';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--season') {
      options.action = 'season';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.season = parseInt(args[++i], 10) || 1;
      }
    } else if (arg === '--credits') {
      options.action = 'credits';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--videos') {
      options.action = 'videos';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--images') {
      options.action = 'images';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--person') {
      options.action = 'person';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--genres') {
      options.action = 'genres';
    } else if (arg === '--discover') {
      options.action = 'discover';
    } else if (arg === '--search') {
      options.action = 'search';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.query = args[++i];
      }
    } else if (arg === '--views') {
      options.action = 'views';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--stream') {
      options.action = 'stream';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--providers') {
      options.action = 'providers';
    } else if (arg === '--sports') {
      options.action = 'sports';
    } else if (arg === '--sports-stream') {
      options.action = 'sports-stream';
    } else if (arg === '--live-tv') {
      options.action = 'live-tv';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        const nextVal = args[++i];
        if (nextVal.length <= 3) {
          options.country = nextVal.toLowerCase();
        } else {
          options.query = nextVal;
        }
      }
    } else if (arg === '--games') {
      options.action = 'games';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.query = args[++i];
      }
    } else if (arg === '--torrent') {
      options.action = 'torrent';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.query = args[++i];
      }
    } else if (arg === '--watchlist') {
      options.action = 'watchlist';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--ratings') {
      options.action = 'ratings';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--announcements') {
      options.action = 'announcements';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.id = args[++i];
      }
    } else if (arg === '--query' && args[i + 1]) {
      options.query = args[++i];
    } else if (arg === '--type' && args[i + 1]) {
      options.type = args[++i];
    } else if (arg === '--window' && args[i + 1]) {
      options.window = args[++i];
    } else if (arg === '--filter' && args[i + 1]) {
      options.filter = args[++i];
    } else if (arg === '--category' && args[i + 1]) {
      options.category = args[++i];
    } else if (arg === '--popular') {
      options.popular = true;
    } else if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg === '--match-id' && args[i + 1]) {
      options.matchId = args[++i];
    } else if (arg === '--id' && args[i + 1]) {
      options.id = args[++i];
    } else if (arg === '--season-num' && args[i + 1]) {
      options.season = parseInt(args[++i], 10) || 1;
    } else if (arg === '--episode' && args[i + 1]) {
      options.episode = parseInt(args[++i], 10) || 1;
    } else if (arg === '--country' && args[i + 1]) {
      options.country = args[++i].toLowerCase();
    } else if (arg === '--countries') {
      options.countries = true;
    } else if (arg === '--tag' && args[i + 1]) {
      options.tag = args[++i];
    } else if (arg === '--game-id' && args[i + 1]) {
      options.gameId = args[++i];
    } else if (arg === '--provider' && args[i + 1]) {
      options.provider = args[++i].toLowerCase();
    } else if (arg === '--lang' && args[i + 1]) {
      options.lang = args[++i];
    } else if (arg === '--sort' && args[i + 1]) {
      options.sort = args[++i];
    } else if (arg === '--genre' && args[i + 1]) {
      options.genre = args[++i];
    } else if (arg === '--year' && args[i + 1]) {
      options.year = parseInt(args[++i], 10);
    } else if (arg === '--page' && args[i + 1]) {
      options.page = parseInt(args[++i], 10) || 1;
    } else if (arg === '--inc') {
      options.inc = true;
    } else if (arg === '--title' && args[i + 1]) {
      options.title = args[++i];
    } else if (arg === '--save' && args[i + 1]) {
      options.save = path.resolve(process.cwd(), args[++i]);
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    }
  }

  return options;
}

function log(msg, quiet = false) {
  if (!quiet) {
    process.stderr.write(`[1Flex] ${msg}\n`);
  }
}

async function main() {
  const options = parseArgs();
  const client = new OneFlex();
  let result = null;

  try {
    switch (options.action) {
      case 'health': {
        log('Running system and endpoint health check...', options.quiet);
        result = await client.healthCheck();
        break;
      }

      case 'trending': {
        log(`Scraping trending (type: ${options.type}, window: ${options.window}, page: ${options.page})...`, options.quiet);
        result = await client.getTrending(options.type, options.window, options.page);
        break;
      }

      case 'movies': {
        log(`Scraping movies (filter: ${options.filter}, page: ${options.page})...`, options.quiet);
        if (options.filter === 'top_rated') {
          result = await client.getTopRatedMovies(options.page);
        } else if (options.filter === 'upcoming') {
          result = await client.getUpcomingMovies(options.page);
        } else if (options.filter === 'now_playing') {
          result = await client.getNowPlayingMovies(options.page);
        } else {
          result = await client.getPopularMovies(options.page);
        }
        break;
      }

      case 'tv': {
        log(`Scraping TV series (filter: ${options.filter}, page: ${options.page})...`, options.quiet);
        if (options.filter === 'top_rated') {
          result = await client.getTopRatedTVShows(options.page);
        } else if (options.filter === 'airing_today') {
          result = await client.getAiringTodayTVShows(options.page);
        } else if (options.filter === 'on_the_air') {
          result = await client.getOnTheAirTVShows(options.page);
        } else {
          result = await client.getPopularTVShows(options.page);
        }
        break;
      }

      case 'details': {
        if (!options.id) throw new Error('--details requires a valid media ID');
        log(`Scraping ${options.type} details for ID ${options.id}...`, options.quiet);
        if (options.type === 'tv') {
          result = await client.getTVShowDetails(options.id);
        } else {
          result = await client.getMovieDetails(options.id);
        }
        break;
      }

      case 'season': {
        if (!options.id) throw new Error('--season requires TV series ID specified via --id <tv_id>');
        log(`Scraping TV season ${options.season} for series ID ${options.id}...`, options.quiet);
        result = await client.getTVSeasonDetails(options.id, options.season);
        break;
      }

      case 'credits': {
        if (!options.id) throw new Error('--credits requires a media ID');
        log(`Scraping credits for ID ${options.id}...`, options.quiet);
        if (options.type === 'tv') {
          result = await client.getTVShowCredits(options.id);
        } else {
          result = await client.getMovieCredits(options.id);
        }
        break;
      }

      case 'videos': {
        if (!options.id) throw new Error('--videos requires a media ID');
        log(`Scraping videos for ID ${options.id}...`, options.quiet);
        result = await client.getVideos(options.type, options.id);
        break;
      }

      case 'images': {
        if (!options.id) throw new Error('--images requires a media ID');
        log(`Scraping images for ID ${options.id}...`, options.quiet);
        result = await client.getImages(options.type, options.id);
        break;
      }

      case 'person': {
        if (!options.id) throw new Error('--person requires a person ID');
        log(`Scraping person details for ID ${options.id}...`, options.quiet);
        result = await client.getPersonDetails(options.id);
        break;
      }

      case 'genres': {
        log(`Scraping genres for ${options.type}...`, options.quiet);
        if (options.type === 'tv') {
          result = await client.getTVGenres();
        } else {
          result = await client.getMovieGenres();
        }
        break;
      }

      case 'discover': {
        log(`Discovering ${options.type} content (page: ${options.page})...`, options.quiet);
        if (options.lang && options.lang !== 'en') {
          result = await client.discoverByLanguage({
            language: options.lang,
            type: options.type,
            sortBy: options.sort,
            page: options.page
          });
        } else if (options.type === 'tv') {
          result = await client.discoverTVShows({
            with_genres: options.genre,
            sort_by: options.sort,
            page: options.page,
            first_air_date_year: options.year
          });
        } else {
          result = await client.discoverMovies({
            with_genres: options.genre,
            sort_by: options.sort,
            page: options.page,
            year: options.year
          });
        }
        break;
      }

      case 'search': {
        if (!options.query) throw new Error('--search requires a query string');
        log(`Searching for "${options.query}" (type: ${options.type})...`, options.quiet);
        if (options.type === 'enhanced') {
          result = await client.enhancedSearch(options.query, options.page);
        } else if (options.type === 'person') {
          result = await client.searchPerson(options.query, options.page);
        } else if (options.type === 'movie') {
          result = await client.searchMovies(options.query, options.page);
        } else if (options.type === 'tv') {
          result = await client.searchTVShows(options.query, options.page);
        } else {
          result = await client.searchMulti(options.query, options.page);
        }
        break;
      }

      case 'views': {
        if (!options.id) throw new Error('--views requires a media ID');
        if (options.inc) {
          log(`Incrementing views for ID ${options.id}...`, options.quiet);
          result = await client.incrementViews(options.type, options.id, options.season, options.episode);
        } else {
          log(`Fetching views for ID ${options.id}...`, options.quiet);
          result = await client.getViews(options.type, options.id, options.season, options.episode);
        }
        break;
      }

      case 'stream': {
        if (!options.id) throw new Error('--stream requires a media ID');
        log(`Resolving streaming embed sources for ID ${options.id}...`, options.quiet);
        result = await client.getStreamSources({
          id: options.id,
          type: options.type,
          season: options.season,
          episode: options.episode,
          title: options.title
        });
        break;
      }

      case 'providers': {
        log('Fetching dynamic embed video providers...', options.quiet);
        result = await client.getEmbedProviders();
        break;
      }

      case 'sports': {
        if (options.filter === 'categories') {
          log('Scraping sports categories...', options.quiet);
          result = await client.getSportsCategories();
        } else {
          log(`Scraping sports matches (filter: ${options.filter}, popular: ${options.popular})...`, options.quiet);
          const matches = await client.getMatches(options.filter, options.popular);
          if (options.category) {
            result = matches.filter(m => m.category === options.category);
          } else {
            result = matches;
          }
        }
        break;
      }

      case 'sports-stream': {
        if (!options.source || !options.matchId) {
          throw new Error('--sports-stream requires --source <src> and --match-id <id>');
        }
        log(`Scraping sports stream (${options.source}/${options.matchId})...`, options.quiet);
        result = await client.getMatchStream(options.source, options.matchId);
        break;
      }

      case 'live-tv': {
        if (options.countries) {
          log('Scraping Live TV countries list...', options.quiet);
          result = await client.getLiveTVCountries();
        } else if (options.query) {
          log(`Searching Live TV channels in ${options.country} for "${options.query}"...`, options.quiet);
          result = await client.searchLiveTVChannels(options.country, options.query);
        } else {
          log(`Scraping Live TV streams for country: ${options.country}...`, options.quiet);
          result = await client.getCountryStreams(options.country);
        }
        break;
      }

      case 'games': {
        if (options.gameId) {
          log(`Scraping game details for directory: ${options.gameId}...`, options.quiet);
          result = await client.getGameDetails(options.gameId);
        } else {
          log(`Scraping games catalog (query: "${options.query}", tag: "${options.tag || ''}")...`, options.quiet);
          result = await client.getGames(options.query || null, options.tag || null);
        }
        break;
      }

      case 'torrent': {
        if (!options.query) throw new Error('--torrent requires a search query');
        log(`Searching torrents via provider ${options.provider} for "${options.query}"...`, options.quiet);
        result = await client.searchTorrents(options.query, options.provider, options.page);
        break;
      }

      case 'watchlist': {
        if (!options.id) throw new Error('--watchlist requires user ID');
        log(`Fetching watchlist for user ${options.id}...`, options.quiet);
        result = await client.getUserWatchlist(options.id);
        break;
      }

      case 'ratings': {
        if (!options.id) throw new Error('--ratings requires user ID');
        log(`Fetching ratings for user ${options.id}...`, options.quiet);
        result = await client.getUserRatings(options.id);
        break;
      }

      case 'announcements': {
        log(`Fetching announcements${options.id ? ` for user ${options.id}` : ''}...`, options.quiet);
        result = await client.getAnnouncements(options.id);
        break;
      }

      default: {
        printHelp();
        process.exit(1);
      }
    }

    const outputJson = JSON.stringify(result, null, 2);

    if (options.save) {
      fs.mkdirSync(path.dirname(options.save), { recursive: true });
      fs.writeFileSync(options.save, outputJson, 'utf8');
      log(`Result saved to file: ${options.save}`, options.quiet);
    }

    process.stdout.write(outputJson + '\n');
  } catch (error) {
    process.stderr.write(`[1Flex Error] ${error.message}\n`);
    process.exit(1);
  }
}

main();
