export const BASE_URL = 'https://www.1flex.org';
export const DB_URL = 'https://db.1flex.org';
export const VIDUKI_API_URL = 'https://api.viduki.net';
export const IPTV_API_URL = 'https://iptv-org.github.io/api';
export const IPTV_RAW_URL = 'https://raw.githubusercontent.com/iptv-org/iptv/master';
export const GAMES_URL = 'https://selenite.cc/resources/games.json';
export const GAMES_ASSETS_URL = 'https://selenite.cc/resources/semag';
export const GAMES_THUMB_URL = 'https://www.1tube.org/games/semag';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const WSRV_IMAGE_BASE = 'https://wsrv.nl/?url=';

export const VIDFAST_DOMAINS = [
  'https://vidfast.pro',
  'https://vidfast.in',
  'https://vidfast.io',
  'https://vidfast.me',
  'https://vidfast.net',
  'https://vidfast.pm',
  'https://vidfast.xyz',
  'https://vidfast.vc',
  'https://vidfast.bz'
];

export const DEFAULT_PROVIDERS = [
  {
    id: 'MAIN_1',
    label: 'Main 1',
    movie: 'https://www.viduki.net/1/movie/{id}?color=FF0000',
    tv: 'https://www.viduki.net/1/tv/{id}/{s}/{e}?color=FF0000'
  },
  {
    id: 'MAIN_2',
    label: 'Main 2',
    movie: 'https://vidy.st/movie/{id}?color=FF0000&overlay=true',
    tv: 'https://vidy.st/tv/{id}/{s}/{e}?color=FF0000&episodeSelector=false&nextEpisode=false&autoplayNextEpisode=false&overlay=true'
  },
  {
    id: 'MAIN_3',
    label: 'Main 3',
    movie: 'https://vidfast.pro/movie/{id}?autoPlay=true&title=true&poster=true&theme=FF0000',
    tv: 'https://vidfast.pro/tv/{id}/{s}/{e}?autoPlay=true&title=true&poster=true&theme=FF0000&nextButton=false&autoNext=false'
  },
  {
    id: 'MAIN_4',
    label: 'Main 4',
    movie: 'https://vidlink.pro/movie/{id}?primaryColor=FF0000&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=false',
    tv: 'https://vidlink.pro/tv/{id}/{s}/{e}?primaryColor=FF0000&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=false'
  },
  {
    id: 'MAIN_5',
    label: 'Main 5',
    movie: 'https://vidrock.ru/movie/{id}?theme=FF0000&autoplay=true&autonext=false&download=false&nextbutton=false&episodeselector=false',
    tv: 'https://vidrock.ru/tv/{id}/{s}/{e}?theme=FF0000&autoplay=true&autonext=false&download=false&nextbutton=false&episodeselector=false'
  },
  {
    id: 'MAIN_6',
    label: 'Main 6',
    movie: 'https://player.vidzee.wtf/embed/movie/{id}?color=FF0000',
    tv: 'https://player.vidzee.wtf/embed/tv/{id}/{s}/{e}?color=FF0000'
  },
  {
    id: 'MULTILANGUAGE',
    label: 'Multi-language',
    movie: 'https://www.viduki.net/2/movie/{id}?color=FF0000',
    tv: 'https://www.viduki.net/2/tv/{id}/{s}/{e}?color=FF0000'
  },
  {
    id: 'PREMIUM_EMBEDS',
    label: 'Premium embeds',
    movie: 'https://www.viduki.net/4/movie/{id}?color=FF0000',
    tv: 'https://www.viduki.net/4/tv/{id}/{s}/{e}?color=FF0000'
  }
];

export const LANGUAGES = [
  { iso_639_1: 'en', name: 'English' },
  { iso_639_1: 'es', name: 'Spanish' },
  { iso_639_1: 'fr', name: 'French' },
  { iso_639_1: 'de', name: 'German' },
  { iso_639_1: 'it', name: 'Italian' },
  { iso_639_1: 'pt', name: 'Portuguese' },
  { iso_639_1: 'ja', name: 'Japanese' },
  { iso_639_1: 'ko', name: 'Korean' },
  { iso_639_1: 'zh', name: 'Chinese' },
  { iso_639_1: 'hi', name: 'Hindi' },
  { iso_639_1: 'ar', name: 'Arabic' },
  { iso_639_1: 'ru', name: 'Russian' },
  { iso_639_1: 'nl', name: 'Dutch' },
  { iso_639_1: 'sv', name: 'Swedish' },
  { iso_639_1: 'no', name: 'Norwegian' },
  { iso_639_1: 'da', name: 'Danish' },
  { iso_639_1: 'fi', name: 'Finnish' },
  { iso_639_1: 'pl', name: 'Polish' },
  { iso_639_1: 'tr', name: 'Turkish' },
  { iso_639_1: 'id', name: 'Indonesian' }
];

export class OneFlex {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || BASE_URL).replace(/\/+$/, '');
    this.dbUrl = (options.dbUrl || DB_URL).replace(/\/+$/, '');
    this.vidukiApiUrl = (options.vidukiApiUrl || VIDUKI_API_URL).replace(/\/+$/, '');
    this.iptvApiUrl = (options.iptvApiUrl || IPTV_API_URL).replace(/\/+$/, '');
    this.iptvRawUrl = (options.iptvRawUrl || IPTV_RAW_URL).replace(/\/+$/, '');
    this.gamesUrl = options.gamesUrl || GAMES_URL;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
    this.timeout = options.timeout || 15000;
    this.cache = new Map();
    this.cacheTtl = options.cacheTtl || 300000;
  }

  async request(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

    const headers = {
      'User-Agent': this.userAgent,
      'Origin': this.baseUrl,
      'Referer': `${this.baseUrl}/`,
      'Accept': ['application/json', 'text/plain', '*/*'].join(', '),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let errMessage = `HTTP ${response.status} ${response.statusText}`;
        if (contentType.includes('application/json')) {
          try {
            const errData = await response.json();
            errMessage = errData.error || errData.message || errMessage;
          } catch {}
        } else {
          try {
            const errText = await response.text();
            if (errText.length < 200) errMessage = errText;
          } catch {}
        }
        const err = new Error(errMessage);
        err.status = response.status;
        throw err;
      }

      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async fetchFromTMDB(endpoint, params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();

    const fullPath = queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint;
    const cacheKey = fullPath;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const url = `${this.dbUrl}${fullPath}`;
    const data = await this.request(url);
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + this.cacheTtl
    });

    return data;
  }

  async getTrending(type = 'all', timeWindow = 'day', page = 1) {
    return this.fetchFromTMDB(`/trending/${type}/${timeWindow}`, { page });
  }

  async getPopularMovies(page = 1) {
    return this.fetchFromTMDB('/movie/popular', { page });
  }

  async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB('/movie/top_rated', { page });
  }

  async getUpcomingMovies(page = 1) {
    return this.fetchFromTMDB('/movie/upcoming', { page });
  }

  async getNowPlayingMovies(page = 1) {
    return this.fetchFromTMDB('/movie/now_playing', { page });
  }

  async getPopularTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/popular', { page });
  }

  async getTopRatedTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/top_rated', { page });
  }

  async getAiringTodayTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/airing_today', { page });
  }

  async getOnTheAirTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/on_the_air', { page });
  }

  async getMovieDetails(id, append = 'images,videos,releases,credits,similar') {
    return this.fetchFromTMDB(`/movie/${id}`, { append_to_response: append });
  }

  async getTVShowDetails(id, append = 'images,videos,content_ratings,credits,similar,aggregate_credits') {
    return this.fetchFromTMDB(`/tv/${id}`, { append_to_response: append });
  }

  async getTVSeasonDetails(id, seasonNumber = 1) {
    return this.fetchFromTMDB(`/tv/${id}/season/${seasonNumber}`);
  }

  async getTVEpisodeDetails(id, seasonNumber = 1, episodeNumber = 1) {
    return this.fetchFromTMDB(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);
  }

  async getTVExternalIds(id) {
    return this.fetchFromTMDB(`/tv/${id}/external_ids`);
  }

  async getMovieCredits(id) {
    return this.fetchFromTMDB(`/movie/${id}/credits`);
  }

  async getTVShowCredits(id) {
    return this.fetchFromTMDB(`/tv/${id}/credits`);
  }

  async getVideos(mediaType = 'movie', id) {
    return this.fetchFromTMDB(`/${mediaType}/${id}/videos`);
  }

  async getImages(mediaType = 'movie', id) {
    return this.fetchFromTMDB(`/${mediaType}/${id}/images`);
  }

  async getPersonDetails(id, append = 'movie_credits,tv_credits') {
    return this.fetchFromTMDB(`/person/${id}`, { append_to_response: append });
  }

  async getMoviesByPerson(personId) {
    return this.fetchFromTMDB(`/person/${personId}/movie_credits`);
  }

  async getTVShowsByPerson(personId) {
    return this.fetchFromTMDB(`/person/${personId}/tv_credits`);
  }

  async getMovieGenres() {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres() {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  async discoverMovies(options = {}) {
    const {
      with_genres,
      sort_by = 'popularity.desc',
      page = 1,
      with_original_language,
      primary_release_year,
      year
    } = options;

    return this.fetchFromTMDB('/discover/movie', {
      with_genres,
      sort_by,
      page,
      with_original_language,
      primary_release_year,
      year
    });
  }

  async discoverTVShows(options = {}) {
    const {
      with_genres,
      sort_by = 'popularity.desc',
      page = 1,
      with_original_language,
      first_air_date_year
    } = options;

    return this.fetchFromTMDB('/discover/tv', {
      with_genres,
      sort_by,
      page,
      with_original_language,
      first_air_date_year
    });
  }

  async discoverByLanguage(options = {}) {
    const {
      language = 'en',
      type = 'movie',
      sortBy = 'popularity.desc',
      page = 1
    } = options;

    return this.fetchFromTMDB(`/discover/${type}`, {
      with_original_language: language,
      sort_by: sortBy,
      page,
      'vote_count.gte': 10
    });
  }

  getLanguagesList() {
    return LANGUAGES;
  }

  async searchMulti(query, page = 1) {
    const res = await this.fetchFromTMDB('/search/multi', {
      query: encodeURIComponent(query),
      page
    });

    if (res && Array.isArray(res.results)) {
      const q = query.toLowerCase().trim();
      res.results = res.results.map(item => {
        const title = (item.title || item.name || '').toLowerCase();
        let score = 0;
        if (title === q) score += 1000;
        else if (title.startsWith(q)) score += 500;
        else if (new RegExp(`\\b${q}\\b`, 'i').test(title)) score += 300;
        else if (title.includes(q)) score += 100;
        score += Math.min(2 * (item.popularity || 0), 50) + 2 * (item.vote_average || 0);
        return { ...item, _relevanceScore: score };
      });
      res.results.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
    }

    return res;
  }

  async searchPerson(query, page = 1) {
    return this.fetchFromTMDB('/search/person', {
      query: encodeURIComponent(query),
      page
    });
  }

  async searchMovies(query, page = 1) {
    return this.fetchFromTMDB('/search/movie', {
      query: encodeURIComponent(query),
      page
    });
  }

  async searchTVShows(query, page = 1) {
    return this.fetchFromTMDB('/search/tv', {
      query: encodeURIComponent(query),
      page
    });
  }

  async enhancedSearch(query, page = 1) {
    try {
      const [multiRes, personRes, movieGenresRes, tvGenresRes] = await Promise.all([
        this.searchMulti(query, page),
        this.searchPerson(query, page),
        this.getMovieGenres(),
        this.getTVGenres()
      ]);

      const results = [];
      const multiFiltered = (multiRes.results || []).filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );
      results.push(...multiFiltered);

      const allGenres = [...(movieGenresRes.genres || []), ...(tvGenresRes.genres || [])];
      const matchedGenres = allGenres.filter(g =>
        g.name.toLowerCase().includes(query.toLowerCase())
      );

      for (const genre of matchedGenres.slice(0, 2)) {
        try {
          const [movGen, tvGen] = await Promise.all([
            this.discoverMovies({ with_genres: genre.id, page: 1 }),
            this.discoverTVShows({ with_genres: genre.id, page: 1 })
          ]);
          const mList = (movGen.results || []).slice(0, 5).map(x => ({ ...x, media_type: 'movie' }));
          const tList = (tvGen.results || []).slice(0, 5).map(x => ({ ...x, media_type: 'tv' }));
          results.push(...mList, ...tList);
        } catch {}
      }

      if (personRes.results && personRes.results.length > 0) {
        for (const person of personRes.results.slice(0, 2)) {
          try {
            const [pMovies, pTV] = await Promise.all([
              this.getMoviesByPerson(person.id),
              this.getTVShowsByPerson(person.id)
            ]);
            const mCast = (pMovies.cast || []).slice(0, 5).map(x => ({ ...x, media_type: 'movie' }));
            const tCast = (pTV.cast || []).slice(0, 5).map(x => ({ ...x, media_type: 'tv' }));
            results.push(...mCast, ...tCast);
          } catch {}
        }
      }

      const uniqueResults = results
        .filter((item, index, self) =>
          self.findIndex(t => t.id === item.id && t.media_type === item.media_type) === index
        )
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 50);

      return {
        results: uniqueResults,
        total_results: uniqueResults.length,
        total_pages: 1
      };
    } catch {
      return this.searchMulti(query, page);
    }
  }

  async getSimilarMovies(id, page = 1) {
    return this.fetchFromTMDB(`/movie/${id}/similar`, { page });
  }

  async getMovieKeywords(id) {
    return this.fetchFromTMDB(`/movie/${id}/keywords`);
  }

  async getTVKeywords(id) {
    return this.fetchFromTMDB(`/tv/${id}/keywords`);
  }

  async getCollection(id) {
    return this.fetchFromTMDB(`/collection/${id}`);
  }

  async getViews(mediaType, id, season = null, episode = null) {
    const typeKey = mediaType === 'tv' ? 'tv' : 'movies';
    const contentId = mediaType === 'tv' && season && episode
      ? `${id}-s${season}-e${episode}`
      : String(id);
    const url = `${this.dbUrl}/views/${typeKey}/${contentId}`;
    return this.request(url);
  }

  async incrementViews(mediaType, id, season = null, episode = null) {
    const typeKey = mediaType === 'tv' ? 'tv' : 'movies';
    const contentId = mediaType === 'tv' && season && episode
      ? `${id}-s${season}-e${episode}`
      : String(id);
    const url = `${this.dbUrl}/views/${typeKey}/${contentId}`;
    return this.request(url, { method: 'POST' });
  }

  async getEmbedProviders() {
    try {
      const data = await this.request(`${this.vidukiApiUrl}/embed_providers?site=1flex`);
      if (Array.isArray(data?.providers) && data.providers.length > 0) {
        return data.providers;
      }
    } catch {}
    return DEFAULT_PROVIDERS;
  }

  async getStreamSources(options = {}) {
    const {
      id,
      type = 'movie',
      season = 1,
      episode = 1,
      color = 'FF0000',
      title = ''
    } = options;

    if (!id) throw new Error('Parameter "id" is required to get stream sources');

    const providers = await this.getEmbedProviders();
    const isMovie = type === 'movie';

    const streams = providers.map(p => {
      const template = isMovie ? p.movie : p.tv;
      let url = template
        .replace(/{id}/g, String(id))
        .replace(/{s}/g, String(season))
        .replace(/{e}/g, String(episode));

      return {
        id: p.id,
        label: p.label,
        type: isMovie ? 'movie' : 'tv',
        url,
        embedUrl: url
      };
    });

    const vidfastMirrors = VIDFAST_DOMAINS.map(domain => {
      const url = isMovie
        ? `${domain}/movie/${id}?autoPlay=true&title=true&poster=true&theme=${color}`
        : `${domain}/tv/${id}/${season}/${episode}?autoPlay=true&title=true&poster=true&theme=${color}&nextButton=false&autoNext=false`;
      const host = new URL(domain).hostname;
      return {
        id: `VIDFAST_${host.replace(/\./g, '_').toUpperCase()}`,
        label: `Vidfast Mirror (${host})`,
        type: isMovie ? 'movie' : 'tv',
        url,
        embedUrl: url
      };
    });

    return {
      id,
      type: isMovie ? 'movie' : 'tv',
      season: isMovie ? null : Number(season),
      episode: isMovie ? null : Number(episode),
      webPlayerUrl: isMovie
        ? `${this.baseUrl}/play?id=${id}&type=movie`
        : `${this.baseUrl}/play?id=${id}&season=${season}&episode=${episode}&type=tv`,
      subtitlesUrl: title ? this.getSubtitlesUrl(title) : null,
      providers: streams,
      mirrors: vidfastMirrors
    };
  }

  getSubtitlesUrl(title) {
    return `https://subscene.cam/search?query=${encodeURIComponent(title)}`;
  }

  getImageUrl(imagePath, size = 'w500', useProxy = false) {
    if (!imagePath) return null;
    const directUrl = `${TMDB_IMAGE_BASE}/${size}${imagePath}`;
    if (useProxy) return `${WSRV_IMAGE_BASE}${encodeURIComponent(directUrl)}`;
    return directUrl;
  }

  getBackdropUrl(backdropPath, size = 'w1280', useProxy = false) {
    if (!backdropPath) return null;
    const directUrl = `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
    if (useProxy) return `${WSRV_IMAGE_BASE}${encodeURIComponent(directUrl)}`;
    return directUrl;
  }

  async getSportsCategories() {
    return this.request(`${this.dbUrl}/api/sports/sports`);
  }

  async getMatches(filter = 'live', popular = false) {
    let endpoint = '/matches/live';
    if (filter === 'today') {
      endpoint = popular ? '/matches/all-today/popular' : '/matches/all-today';
    } else if (filter === 'all') {
      endpoint = popular ? '/matches/all/popular' : '/matches/all';
    } else {
      endpoint = popular ? '/matches/live/popular' : '/matches/live';
    }

    const matches = await this.request(`${this.dbUrl}/api/sports${endpoint}`);
    if (!Array.isArray(matches)) return [];

    return matches.map(match => ({
      ...match,
      badgeHomeUrl: match.teams?.home?.badge ? `${this.dbUrl}/api/sports/images/badge/${match.teams.home.badge}.webp` : null,
      badgeAwayUrl: match.teams?.away?.badge ? `${this.dbUrl}/api/sports/images/badge/${match.teams.away.badge}.webp` : null,
      posterUrl: match.poster ? `${this.dbUrl}${match.poster}` : null
    }));
  }

  async getMatchStream(source, matchId) {
    if (!source || !matchId) throw new Error('Both "source" and "matchId" are required');
    return this.request(`${this.dbUrl}/api/sports/stream/${source}/${matchId}`);
  }

  async getLiveTVCountries() {
    try {
      const data = await this.request(`${this.iptvApiUrl}/countries.json`);
      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name,
          code: (item.code || '').toLowerCase(),
          flag: item.flag || null,
          languages: item.languages || []
        }));
      }
    } catch {}

    const res = await this.request('https://api.github.com/repos/iptv-org/iptv/contents/streams');
    if (Array.isArray(res)) {
      return res
        .filter(item => item.name && item.name.endsWith('.m3u'))
        .map(item => {
          const code = item.name.replace(/\.m3u$/, '').toLowerCase();
          return {
            name: code.toUpperCase(),
            code,
            downloadUrl: item.download_url
          };
        });
    }
    return [];
  }

  async getCountryStreams(countryCode = 'us') {
    const code = countryCode.toLowerCase().trim();
    const url = `${this.iptvRawUrl}/streams/${code}.m3u`;
    const text = await this.request(url);

    const lines = text.split('\n');
    const channels = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF')) {
        const titleMatch = line.match(/,(.+)$/);
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
        const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
        const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
        const groupMatch = line.match(/group-title="([^"]*)"/);

        let streamUrl = '';
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('#')) {
            streamUrl = nextLine;
            i = j;
            break;
          }
        }

        if (streamUrl && !streamUrl.startsWith('http://')) {
          channels.push({
            title,
            id: tvgIdMatch ? tvgIdMatch[1] : null,
            logo: tvgLogoMatch ? tvgLogoMatch[1] : null,
            group: groupMatch ? groupMatch[1] : null,
            url: streamUrl,
            country: code
          });
        }
      }
    }

    return channels;
  }

  async searchLiveTVChannels(countryCode = 'us', query = '') {
    const channels = await this.getCountryStreams(countryCode);
    if (!query) return channels;
    const q = query.toLowerCase().trim();
    return channels.filter(ch =>
      (ch.title && ch.title.toLowerCase().includes(q)) ||
      (ch.group && ch.group.toLowerCase().includes(q)) ||
      (ch.id && ch.id.toLowerCase().includes(q))
    );
  }

  async getGames(query = null, tag = null) {
    const raw = await this.request(this.gamesUrl);
    if (!Array.isArray(raw)) return [];

    let games = raw.map(g => ({
      name: g.name,
      directory: g.directory,
      image: g.image,
      tags: g.tags || [],
      thumbnailUrl: `${GAMES_THUMB_URL}/${g.directory}/${g.image}`,
      fallbackThumbnailUrl: `${GAMES_ASSETS_URL}/${g.directory}/${g.image}`,
      playUrl: `${GAMES_ASSETS_URL}/${g.directory}/index.html`
    })).sort((a, b) => a.name.localeCompare(b.name));

    if (query) {
      const q = query.toLowerCase().trim();
      games = games.filter(g => g.name.toLowerCase().includes(q) || g.directory.toLowerCase().includes(q));
    }

    if (tag) {
      const t = tag.toLowerCase().trim();
      games = games.filter(g => g.tags.some(item => item.toLowerCase() === t));
    }

    return games;
  }

  async getGameDetails(directory) {
    const all = await this.getGames();
    return all.find(g => g.directory.toLowerCase() === directory.toLowerCase()) || null;
  }

  async searchTorrents(query, provider = 'yts', page = 1) {
    if (!query) throw new Error('Search query is required for torrent search');
    const validProviders = ['piratebay', '1337x', 'yts', 'nyaasi'];
    const prov = validProviders.includes(provider.toLowerCase()) ? provider.toLowerCase() : 'yts';

    const url = `${this.baseUrl}/api/torrent/${prov}?query=${encodeURIComponent(query)}&page=${page}`;
    return this.request(url);
  }

  async getAltchaChallenge() {
    return this.request(`${this.baseUrl}/api/auth/altcha-challenge`);
  }

  async login(credentials = {}) {
    const { email, password, altcha } = credentials;
    return this.request(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, altcha })
    });
  }

  async signup(data = {}) {
    const { name, email, password, altcha } = data;
    return this.request(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, altcha })
    });
  }

  async validateUser(userId) {
    if (!userId) throw new Error('userId is required');
    return this.request(`${this.baseUrl}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: userId })
    });
  }

  async getUserWatchlist(userId) {
    if (!userId) throw new Error('userId is required');
    return this.request(`${this.baseUrl}/api/lists/get-user-lists?userId=${encodeURIComponent(userId)}`);
  }

  async addToWatchlist(item = {}) {
    const { userId, mediaId, mediaType, title, posterPath, backdropPath, releaseDate, rating } = item;
    return this.request(`${this.baseUrl}/api/lists/add-to-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        mediaId,
        mediaType: mediaType || 'movie',
        title,
        posterPath,
        backdropPath,
        releaseDate,
        rating
      })
    });
  }

  async removeFromWatchlist(data = {}) {
    const { userId, mediaId, mediaType } = data;
    return this.request(`${this.baseUrl}/api/lists/remove-from-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mediaId, mediaType })
    });
  }

  async getUserRatings(userId) {
    if (!userId) throw new Error('userId is required');
    return this.request(`${this.baseUrl}/api/ratings/get-user-ratings?userId=${encodeURIComponent(userId)}`);
  }

  async rateContent(ratingData = {}) {
    return this.request(`${this.baseUrl}/api/ratings/rate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratingData)
    });
  }

  async getAnnouncements(userId) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`${this.baseUrl}/api/notifications/get-announcements${q}`);
  }

  async healthCheck() {
    const tests = [
      {
        service: '1Flex Homepage',
        fn: () => this.request(this.baseUrl, { headers: { 'Accept': 'text/html' } })
      },
      {
        service: 'TMDB Proxy (db.1flex.org)',
        fn: () => this.getTrending('all', 'day')
      },
      {
        service: 'Embed Providers (api.viduki.net)',
        fn: () => this.getEmbedProviders()
      },
      {
        service: 'Sports Catalog (db.1flex.org)',
        fn: () => this.getSportsCategories()
      },
      {
        service: 'Live TV Feeds (iptv-org)',
        fn: () => this.getCountryStreams('us')
      },
      {
        service: 'Games Catalog (selenite)',
        fn: () => this.getGames()
      },
      {
        service: 'Torrent API (1flex.org/api/torrent)',
        fn: () => this.searchTorrents('batman', 'yts', 1)
      }
    ];

    const results = [];
    for (const test of tests) {
      const start = Date.now();
      try {
        await test.fn();
        results.push({
          service: test.service,
          status: 'ok',
          latencyMs: Date.now() - start
        });
      } catch (err) {
        results.push({
          service: test.service,
          status: 'error',
          error: err.message,
          latencyMs: Date.now() - start
        });
      }
    }

    const allOk = results.every(r => r.status === 'ok');
    return {
      healthy: allOk,
      timestamp: new Date().toISOString(),
      services: results
    };
  }
}
