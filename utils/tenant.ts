export const getStoreFromHost = (host: string): string => {
  const subdomain = host.split('.')[0]
  return subdomain === 'api' ? '' : subdomain
}
