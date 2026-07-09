import type { VercelRequest, VercelResponse } from '@vercel/node'

interface IgdbGame {
  id: number
  name?: string
  rating?: number
  rating_count?: number
  aggregated_rating?: number
  aggregated_rating_count?: number
  summary?: string
  cover?: { image_id?: string }
  genres?: { name: string }[]
  themes?: { name: string }[]
  platforms?: { name: string }[]
  similar_games?: { name: string; cover?: { image_id?: string } }[]
  involved_companies?: {
    company?: { name?: string }
    developer?: boolean
    publisher?: boolean
  }[]
  external_games?: { category?: number; uid?: string }[]
}

interface EnrichedGame {
  steam_appid: number
  name?: string
  cover_url?: string
  rating?: number
  rating_count?: number
  aggregated_rating?: number
  summary?: string
  genres?: string[]
  themes?: string[]
  platforms?: string[]
  developer?: string
  publisher?: string
  similar_games?: { name: string; cover_url?: string }[]
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getTwitchToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable')
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`
  const resp = await fetch(url, { method: 'POST' })
  if (!resp.ok) {
    throw new Error(`Twitch OAuth failed: ${resp.status} ${await resp.text()}`)
  }
  const data = (await resp.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }
  return cachedToken.token
}

function coverUrl(imageId?: string, size: 'thumb' | 'cover_big' | '1080p' = 'cover_big'): string | undefined {
  if (!imageId) return undefined
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`
}

function transform(g: IgdbGame): EnrichedGame {
  const steamExt = g.external_games?.find((e) => e.category === 1)
  const developer = g.involved_companies?.find((c) => c.developer)?.company?.name
  const publisher = g.involved_companies?.find((c) => c.publisher)?.company?.name

  return {
    steam_appid: Number(steamExt?.uid ?? g.id),
    name: g.name,
    cover_url: coverUrl(g.cover?.image_id),
    rating: g.rating,
    rating_count: g.rating_count,
    aggregated_rating: g.aggregated_rating,
    summary: g.summary,
    genres: g.genres?.map((x) => x.name),
    themes: g.themes?.map((x) => x.name),
    platforms: g.platforms?.map((x) => x.name),
    developer,
    publisher,
    similar_games: g.similar_games?.slice(0, 6).map((s) => ({
      name: s.name,
      cover_url: coverUrl(s.cover?.image_id, 'cover_big'),
    })),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  let appids: number[] = []
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    appids = Array.isArray(body?.steam_appids) ? body.steam_appids.map(Number) : []
  } else {
    const q = req.query.steam_appids
    if (typeof q === 'string') {
      appids = q.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n))
    }
  }

  appids = Array.from(new Set(appids)).slice(0, 100)
  if (appids.length === 0) {
    return res.status(400).json({ error: 'Provide steam_appids (comma-delimited query or POST body { steam_appids: [] })' })
  }

  try {
    const token = await getTwitchToken()
    const clientId = process.env.TWITCH_CLIENT_ID as string
    const idsList = appids.map((id) => `"${id}"`).join(',')

    // Step 1: resolve Steam appids -> IGDB game IDs via /external_games.
    const extResp = await fetch('https://api.igdb.com/v4/external_games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `fields game, uid; where external_game_source = 1 & uid = (${idsList}); limit ${appids.length};`,
    })
    if (!extResp.ok) {
      return res.status(502).json({ error: 'IGDB external_games lookup failed', detail: await extResp.text() })
    }
    const externals = (await extResp.json()) as { game: number; uid: string }[]
    const gameIdToAppid = new Map<number, number>()
    for (const e of externals) gameIdToAppid.set(e.game, Number(e.uid))
    const gameIds = Array.from(gameIdToAppid.keys())

    if (gameIds.length === 0) {
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
      return res.status(200).json({ games: [] })
    }

    // Step 2: fetch full game details for the resolved IGDB IDs.
    const gamesResp = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields
          name,
          rating, rating_count, aggregated_rating, aggregated_rating_count,
          summary,
          cover.image_id,
          genres.name,
          themes.name,
          platforms.name,
          similar_games.name, similar_games.cover.image_id,
          involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where id = (${gameIds.join(',')});
        limit ${gameIds.length};
      `,
    })
    if (!gamesResp.ok) {
      return res.status(502).json({ error: 'IGDB games lookup failed', detail: await gamesResp.text() })
    }

    const games = (await gamesResp.json()) as IgdbGame[]
    const enriched = games.map((g) => {
      const base = transform(g)
      base.steam_appid = gameIdToAppid.get(g.id) ?? base.steam_appid
      return base
    })

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json({ games: enriched })
  } catch (err: any) {
    console.error('IGDB proxy error:', err)
    return res.status(500).json({ error: 'IGDB proxy failed', detail: err?.message })
  }
}
