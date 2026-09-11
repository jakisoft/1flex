const VIDROCK_KEY = '7f3e9c2a8b5d1f4e6a9c3b7d2e5f8a1c4b6d9e2f5a8c1b4d7e9f2a5c8b1d4e7f';
const VIDROCK_DOMAINS = ['https://vidrock.ru', 'https://vidrock.net'];
const VIDZEE_CORE_URL = 'https://core.vidzee.wtf';
const VIDZEE_PLAYER_URL = 'https://player.vidzee.wtf';
const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

let vidzeeWasmDecrypt = null;

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function base64UrlToBytes(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export async function decryptVidrock(ciphertext) {
  if (!ciphertext || typeof ciphertext !== 'string') return null;
  const data = base64UrlToBytes(ciphertext);
  if (data.length < 28) return null;
  const iv = data.slice(0, 12);
  const cipher = data.slice(12);
  const keyBytes = hexToBytes(VIDROCK_KEY);
  const key = await crypto.subtle.importKey('raw', keyBytes.buffer, { name: 'AES-GCM' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(decrypted);
}

export async function getVidzeeDecryptor() {
  if (vidzeeWasmDecrypt) return vidzeeWasmDecrypt;
  try {
    const res = await fetch(`${VIDZEE_PLAYER_URL}/assets/streams-BHpSC3gU.js`, {
      headers: { 'User-Agent': DEFAULT_UA }
    });
    if (!res.ok) return null;
    let code = await res.text();
    code = code.replace('typeof window>"u"', 'false');
    code = code.replace('window.location.hostname.toLowerCase()', '"player.vidzee.wtf"');
    code = code.replace('export{M as loadStreamCrypto,x as wasmDecrypt};', 'globalThis.wasmDecrypt = x;');
    const vm = await import('node:vm');
    const ctx = {
      WebAssembly,
      atob,
      ArrayBuffer,
      Uint8Array,
      Uint16Array,
      Uint32Array,
      DataView,
      Map,
      TextDecoder,
      JSON,
      Error,
      TypeError,
      String,
      globalThis: {}
    };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(code, ctx);
    vidzeeWasmDecrypt = ctx.wasmDecrypt;
    return vidzeeWasmDecrypt;
  } catch {
    return null;
  }
}

export async function resolveVidrock(type = 'movie', id, season = 1, episode = 1) {
  const isTv = type === 'tv';
  const path = isTv ? `tv/${id}/${season}/${episode}` : `movie/${id}`;
  const streams = [];

  for (const domain of VIDROCK_DOMAINS) {
    try {
      const res = await fetch(`${domain}/api/${path}`, {
        headers: {
          'User-Agent': DEFAULT_UA,
          'Referer': `${domain}/`
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const [server, info] of Object.entries(data)) {
        if (!info || typeof info !== 'object' || !info.url) continue;
        try {
          const directUrl = await decryptVidrock(info.url);
          if (directUrl && typeof directUrl === 'string') {
            const isHls = directUrl.includes('.m3u8') || info.type === 'hls';
            streams.push({
              provider: 'vidrock',
              server,
              type: isHls ? 'hls' : 'mp4',
              format: isHls ? 'm3u8' : 'mp4',
              language: info.language || 'English',
              flag: info.flag || 'us',
              url: directUrl,
              headers: {
                'Referer': `${domain}/`
              }
            });
          }
        } catch {}
      }
      if (streams.length > 0) break;
    } catch {}
  }
  return streams;
}

export async function resolveVidzee(type = 'movie', id, season = 1, episode = 1) {
  const isTv = type === 'tv';
  const streams = [];
  let subtitles = [];

  try {
    const decryptor = await getVidzeeDecryptor();
    if (!decryptor) return { streams, subtitles };

    const path = isTv ? `streams/tv/${id}/${season}/${episode}` : `streams/movie/${id}`;
    const servers = ['dcloud', 'tik', 'ipcloud'];

    for (const server of servers) {
      try {
        const res = await fetch(`${VIDZEE_CORE_URL}/${path}?s=${encodeURIComponent(server)}&e=1`, {
          headers: {
            'User-Agent': DEFAULT_UA,
            'Referer': `${VIDZEE_PLAYER_URL}/`,
            'Origin': VIDZEE_PLAYER_URL
          }
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.c) {
          const decrypted = await decryptor(data.c);
          if (decrypted && decrypted.url) {
            const isHls = decrypted.url.includes('.m3u8');
            streams.push({
              provider: 'vidzee',
              server,
              type: isHls ? 'hls' : 'mp4',
              format: isHls ? 'm3u8' : 'mp4',
              language: decrypted.language || 'Auto',
              url: decrypted.url,
              headers: {
                'Referer': `${VIDZEE_PLAYER_URL}/`,
                'Origin': VIDZEE_PLAYER_URL
              }
            });
          }
        }
      } catch {}
    }

    try {
      const subPath = isTv ? `subs/tv/${id}/${season}/${episode}` : `subs/movie/${id}`;
      const subRes = await fetch(`${VIDZEE_CORE_URL}/${subPath}`, {
        headers: {
          'User-Agent': DEFAULT_UA,
          'Referer': `${VIDZEE_PLAYER_URL}/`,
          'Origin': VIDZEE_PLAYER_URL
        }
      });
      if (subRes.ok) {
        const subData = await subRes.json();
        if (Array.isArray(subData)) {
          subtitles = subData.map(s => ({
            label: s.label || 'Unknown',
            url: s.file,
            format: 'vtt'
          }));
        }
      }
    } catch {}
  } catch {}

  return { streams, subtitles };
}

export function unpackPacker(code) {
  if (!code || typeof code !== 'string') return '';
  const match = code.match(/}\s*\(\s*['"](.*?)(?<!\\)['"]\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*['"](.*?)(?<!\\)['"]\.split\(['"]\\?\|['"]\)/s);
  if (!match) return code;
  let [, p, a, c, k] = match;
  a = parseInt(a, 10);
  c = parseInt(c, 10);
  const dict = k.split('|');
  const lookup = (n) => {
    return (n < a ? '' : lookup(Math.floor(n / a))) + ((n = n % a) > 35 ? String.fromCharCode(n + 29) : n.toString(36));
  };
  while (c--) {
    if (dict[c]) {
      const sym = lookup(c);
      p = p.replace(new RegExp('\\b' + sym + '\\b', 'g'), dict[c]);
    }
  }
  return p;
}

export function extractStreamsFromHtml(html, baseUrl = '') {
  const streams = [];
  const subtitles = [];
  if (!html || typeof html !== 'string') return { streams, subtitles };

  let unpacked = html;
  const packerMatches = html.match(/eval\(function\(p,a,c,k,e,[rd][\s\S]*?\.split\('\|'\)\)\)/g);
  if (packerMatches) {
    for (const pm of packerMatches) {
      unpacked += '\n' + unpackPacker(pm);
    }
  }

  const m3u8Regex = /(https?:\/\/[^\s"'`<>\\]+?\.m3u8[^\s"'`<>\\]*)/gi;
  let m3u8Match;
  while ((m3u8Match = m3u8Regex.exec(unpacked)) !== null) {
    const rawUrl = m3u8Match[1].replace(/\\/g, '');
    if (!streams.some(s => s.url === rawUrl)) {
      streams.push({
        provider: 'generic',
        server: 'HLS',
        type: 'hls',
        format: 'm3u8',
        url: rawUrl,
        headers: baseUrl ? { 'Referer': baseUrl } : {}
      });
    }
  }

  const mp4Regex = /(https?:\/\/[^\s"'`<>\\]+?\.mp4[^\s"'`<>\\]*)/gi;
  let mp4Match;
  while ((mp4Match = mp4Regex.exec(unpacked)) !== null) {
    const rawUrl = mp4Match[1].replace(/\\/g, '');
    if (!streams.some(s => s.url === rawUrl)) {
      streams.push({
        provider: 'generic',
        server: 'Direct',
        type: 'mp4',
        format: 'mp4',
        url: rawUrl,
        headers: baseUrl ? { 'Referer': baseUrl } : {}
      });
    }
  }

  const fileRegex = /file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi;
  let fileMatch;
  while ((fileMatch = fileRegex.exec(unpacked)) !== null) {
    let rawUrl = fileMatch[1];
    if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;
    else if (rawUrl.startsWith('/') && baseUrl) rawUrl = new URL(rawUrl, baseUrl).href;
    const isHls = rawUrl.includes('.m3u8');
    if (!streams.some(s => s.url === rawUrl)) {
      streams.push({
        provider: 'generic',
        server: 'JWPlayer',
        type: isHls ? 'hls' : 'mp4',
        format: isHls ? 'm3u8' : 'mp4',
        url: rawUrl,
        headers: baseUrl ? { 'Referer': baseUrl } : {}
      });
    }
  }

  const vttRegex = /(https?:\/\/[^\s"'`<>\\]+?\.(?:vtt|srt)[^\s"'`<>\\]*)/gi;
  let vttMatch;
  while ((vttMatch = vttRegex.exec(unpacked)) !== null) {
    const subUrl = vttMatch[1].replace(/\\/g, '');
    if (!subtitles.some(s => s.url === subUrl)) {
      subtitles.push({
        label: 'Subtitle',
        url: subUrl,
        format: subUrl.includes('.vtt') ? 'vtt' : 'srt'
      });
    }
  }

  return { streams, subtitles };
}

export async function resolveGenericEmbed(url, depth = 0) {
  if (!url || depth > 2) return { streams: [], subtitles: [] };

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!res.ok) return { streams: [], subtitles: [] };
    const html = await res.text();
    const result = extractStreamsFromHtml(html, url);

    if (result.streams.length === 0 && depth < 2) {
      const iframeMatches = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
      for (let iframeSrc of iframeMatches) {
        if (iframeSrc.startsWith('//')) iframeSrc = 'https:' + iframeSrc;
        else if (iframeSrc.startsWith('/')) iframeSrc = new URL(iframeSrc, url).href;
        if (iframeSrc.startsWith('http')) {
          const nested = await resolveGenericEmbed(iframeSrc, depth + 1);
          result.streams.push(...nested.streams);
          result.subtitles.push(...nested.subtitles);
        }
      }
    }

    return result;
  } catch {
    return { streams: [], subtitles: [] };
  }
}

export class EmbedResolver {
  constructor(options = {}) {
    this.userAgent = options.userAgent || DEFAULT_UA;
    this.timeout = options.timeout || 15000;
  }

  async resolveDirectStreams(options = {}) {
    const {
      id,
      type = 'movie',
      season = 1,
      episode = 1
    } = options;

    if (!id) throw new Error('Parameter "id" is required to resolve direct streams');

    const [vidrockResult, vidzeeResult] = await Promise.allSettled([
      resolveVidrock(type, id, season, episode),
      resolveVidzee(type, id, season, episode)
    ]);

    const streams = [];
    const subtitles = [];

    if (vidrockResult.status === 'fulfilled' && Array.isArray(vidrockResult.value)) {
      streams.push(...vidrockResult.value);
    }

    if (vidzeeResult.status === 'fulfilled' && vidzeeResult.value) {
      if (Array.isArray(vidzeeResult.value.streams)) {
        streams.push(...vidzeeResult.value.streams);
      }
      if (Array.isArray(vidzeeResult.value.subtitles)) {
        subtitles.push(...vidzeeResult.value.subtitles);
      }
    }

    const m3u8Streams = streams.filter(s => s.format === 'm3u8');
    const mp4Streams = streams.filter(s => s.format === 'mp4');

    return {
      id,
      type,
      season: type === 'tv' ? Number(season) : null,
      episode: type === 'tv' ? Number(episode) : null,
      totalStreams: streams.length,
      totalM3u8: m3u8Streams.length,
      totalMp4: mp4Streams.length,
      streams,
      m3u8Streams,
      mp4Streams,
      subtitles
    };
  }

  async resolveEmbedUrl(embedUrl) {
    if (!embedUrl || typeof embedUrl !== 'string') {
      throw new Error('Valid embedUrl string is required');
    }

    const vidrockMovieMatch = embedUrl.match(/vidrock\.(?:ru|net)\/movie\/([0-9]+)/i);
    const vidrockTvMatch = embedUrl.match(/vidrock\.(?:ru|net)\/tv\/([0-9]+)\/([0-9]+)\/([0-9]+)/i);

    if (vidrockMovieMatch) {
      const streams = await resolveVidrock('movie', vidrockMovieMatch[1]);
      return { url: embedUrl, provider: 'vidrock', streams, subtitles: [] };
    }
    if (vidrockTvMatch) {
      const streams = await resolveVidrock('tv', vidrockTvMatch[1], vidrockTvMatch[2], vidrockTvMatch[3]);
      return { url: embedUrl, provider: 'vidrock', streams, subtitles: [] };
    }

    const vidzeeMovieMatch = embedUrl.match(/vidzee\.wtf\/embed\/movie\/([0-9]+)/i);
    const vidzeeTvMatch = embedUrl.match(/vidzee\.wtf\/embed\/tv\/([0-9]+)\/([0-9]+)\/([0-9]+)/i);

    if (vidzeeMovieMatch) {
      const res = await resolveVidzee('movie', vidzeeMovieMatch[1]);
      return { url: embedUrl, provider: 'vidzee', streams: res.streams, subtitles: res.subtitles };
    }
    if (vidzeeTvMatch) {
      const res = await resolveVidzee('tv', vidzeeTvMatch[1], vidzeeTvMatch[2], vidzeeTvMatch[3]);
      return { url: embedUrl, provider: 'vidzee', streams: res.streams, subtitles: res.subtitles };
    }

    const genericRes = await resolveGenericEmbed(embedUrl);
    return { url: embedUrl, provider: 'generic', streams: genericRes.streams, subtitles: genericRes.subtitles };
  }

  async validateStream(url, headers = {}) {
    try {
      const start = Date.now();
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Range': 'bytes=0-1024',
          ...headers
        }
      });
      const latencyMs = Date.now() - start;
      const contentType = res.headers.get('content-type') || '';
      const ok = res.status >= 200 && res.status < 400;
      return {
        url,
        active: ok,
        status: res.status,
        contentType,
        latencyMs,
        isM3u8: contentType.includes('mpegurl') || contentType.includes('m3u8') || url.includes('.m3u8')
      };
    } catch (err) {
      return {
        url,
        active: false,
        status: null,
        error: err.message,
        isM3u8: url.includes('.m3u8')
      };
    }
  }
}
