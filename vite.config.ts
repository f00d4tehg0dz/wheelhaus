import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Dev-time middleware that emulates the /api/igdb Vercel serverless function.
// Keeps `npm run dev` working end-to-end so you don't need to run `vercel dev`.
function igdbDevPlugin(env: Record<string, string>): Plugin {
  let cachedToken: { token: string; expiresAt: number } | null = null

  const getToken = async (): Promise<string> => {
    if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token
    const clientId = env.TWITCH_CLIENT_ID
    const clientSecret = env.TWITCH_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in .env')
    }
    const url = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`
    const resp = await fetch(url, { method: 'POST' })
    if (!resp.ok) throw new Error(`Twitch OAuth failed: ${resp.status} ${await resp.text()}`)
    const data = (await resp.json()) as { access_token: string; expires_in: number }
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    }
    return cachedToken.token
  }

  const coverUrl = (id?: string, size: 'thumb' | 'cover_big' | '1080p' = 'cover_big'): string | undefined =>
    id ? `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.jpg` : undefined

  const respondJson = (res: ServerResponse, status: number, body: unknown) => {
    res.statusCode = status
    res.setHeader('content-type', 'application/json')
    res.setHeader('access-control-allow-origin', '*')
    res.end(JSON.stringify(body))
  }

  return {
    name: 'igdb-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/igdb', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.setHeader('access-control-allow-origin', '*')
            res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
            res.setHeader('access-control-allow-headers', 'Content-Type')
            res.end()
            return
          }

          // Parse steam_appids from POST body or query string.
          let appids: number[] = []
          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            const raw = chunks.length ? Buffer.concat(chunks).toString('utf-8') : ''
            const body = raw ? JSON.parse(raw) : {}
            appids = Array.isArray(body?.steam_appids)
              ? body.steam_appids.map((n: unknown) => Number(n)).filter(Number.isFinite)
              : []
          } else {
            const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
            const q = url.searchParams.get('steam_appids')
            if (q) appids = q.split(',').map((s) => Number(s.trim())).filter(Number.isFinite)
          }

          appids = Array.from(new Set(appids)).slice(0, 100)
          if (appids.length === 0) {
            return respondJson(res, 400, { error: 'Provide steam_appids (POST body { steam_appids: [] } or comma-delimited query)' })
          }

          const token = await getToken()
          const idsList = appids.map((id) => `"${id}"`).join(',')

          // Step 1: resolve Steam appids -> IGDB game IDs via /external_games.
          // Filtering nested external_games on /games directly is unreliable in APIcalypse.
          const extResp = await fetch('https://api.igdb.com/v4/external_games', {
            method: 'POST',
            headers: {
              'Client-ID': env.TWITCH_CLIENT_ID,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain',
            },
            body: `fields game, uid; where external_game_source = 1 & uid = (${idsList}); limit ${appids.length};`,
          })
          if (!extResp.ok) {
            return respondJson(res, 502, { error: 'IGDB external_games lookup failed', detail: await extResp.text() })
          }
          const externals = (await extResp.json()) as { game: number; uid: string }[]
          const gameIdToAppid = new Map<number, number>()
          for (const e of externals) gameIdToAppid.set(e.game, Number(e.uid))
          const gameIds = Array.from(gameIdToAppid.keys())

          if (gameIds.length === 0) {
            return respondJson(res, 200, { games: [] })
          }

          // Step 2: fetch full game details for the resolved IGDB IDs.
          const gamesResp = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
              'Client-ID': env.TWITCH_CLIENT_ID,
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
            return respondJson(res, 502, { error: 'IGDB games lookup failed', detail: await gamesResp.text() })
          }

          const games = (await gamesResp.json()) as any[]
          const enriched = games.map((g) => {
            const developer = g.involved_companies?.find((c: any) => c.developer)?.company?.name
            const publisher = g.involved_companies?.find((c: any) => c.publisher)?.company?.name
            return {
              steam_appid: gameIdToAppid.get(g.id) ?? 0,
              name: g.name,
              cover_url: coverUrl(g.cover?.image_id),
              rating: g.rating,
              rating_count: g.rating_count,
              aggregated_rating: g.aggregated_rating,
              summary: g.summary,
              genres: g.genres?.map((x: any) => x.name),
              themes: g.themes?.map((x: any) => x.name),
              platforms: g.platforms?.map((x: any) => x.name),
              developer,
              publisher,
              similar_games: g.similar_games?.slice(0, 6).map((s: any) => ({
                name: s.name,
                cover_url: coverUrl(s.cover?.image_id, 'cover_big'),
              })),
            }
          })

          respondJson(res, 200, { games: enriched })
        } catch (err: any) {
          console.error('[igdb-dev-middleware]', err?.message ?? err)
          respondJson(res, 500, { error: 'IGDB dev proxy failed', detail: err?.message })
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), igdbDevPlugin(env)],
  }
})
