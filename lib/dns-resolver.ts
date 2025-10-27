export async function resolveDomain(domain: string): Promise<string[]> {
  // Mock resolver - in production, use a real DNS library
  // For demo, return some example IPs based on domain
  const mockData: Record<string, string[]> = {
    "example.com": ["93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946"],
    "google.com": ["142.250.185.46", "2607:f8b0:4004:80a::200e"],
    "cloudflare.com": ["104.16.132.229", "2606:4700::6810:84e5"],
  }

  const normalized = domain.toLowerCase()
  if (mockData[normalized]) {
    return mockData[normalized]
  }

  // For unknown domains, generate a mock IP
  const hash = normalized.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  const ip = `192.0.2.${(hash % 254) + 1}`
  return [ip]
}

export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
  const ipv6Regex = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(\/\d{1,3})?$/i
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i
  return domainRegex.test(domain)
}
