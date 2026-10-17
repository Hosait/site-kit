import net from 'node:net'

// Loopback, private, link-local, shared (CGNAT) and unique-local addresses: the proxies in front
// of a site on Hosait, never a visitor on the internet.
const INTERNAL = new net.BlockList()
for (const [address, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16]] as const) INTERNAL.addSubnet(address, bits, 'ipv4')
for (const [address, bits] of [['::1', 128], ['fc00::', 7], ['fe80::', 10]] as const) INTERNAL.addSubnet(address, bits, 'ipv6')

const internal = (ip: string) => {
  const v = net.isIP(ip)
  return v === 0 || INTERNAL.check(ip, v === 4 ? 'ipv4' : 'ipv6')
}

/**
 * The visitor's address. On Hosait the edge proxy (NPM) appends it to X-Forwarded-For, and the
 * worker's ingress appends the edge's internal address after it; a visitor can only add entries
 * before them. So it is the rightmost public entry. With none (a local test) the leftmost, and
 * without the header 'local'.
 */
export function clientAddress(forwardedFor: string | null | undefined): string {
  const list = (forwardedFor ?? '')
    .split(',')
    .map((s) => s.trim().replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, ''))
    .filter(Boolean)
    .slice(-20)
  for (let i = list.length - 1; i >= 0; i--) if (!internal(list[i])) return list[i]
  return list[0] ?? 'local'
}
