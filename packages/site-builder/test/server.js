// A tiny local website for tests. Each route is { status, headers, body } or a function of the request.
import http from 'node:http'

export function serve(routes) {
  const requests = []
  const server = http.createServer((req, res) => {
    requests.push(req.url)
    const r = routes[req.url.split('?')[0]] ?? routes[req.url]
    const route = typeof r === 'function' ? r(req) : r
    if (!route) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<h1>Not found</h1>') }
    res.writeHead(route.status ?? 200, { 'content-type': 'text/html; charset=utf-8', ...(route.headers ?? {}) })
    res.end(route.body ?? '')
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    resolve({ url: `http://127.0.0.1:${port}`, requests, close: () => new Promise((r) => server.close(r)) })
  }))
}
