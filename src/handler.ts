import { allowedMethod, parseRequest, timeNow } from './utils'
import serveResult from './helpers'

export default async function checkCache(request: Request): Promise<Response> {
  const now = timeNow()
  if (allowedMethod.indexOf(request.method) === -1) {
    return Response.json({
      success: false,
      message: 'Method not allowed'
    }, {
      status: 405,
      headers: {
        'Allow': allowedMethod.join(', '),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': allowedMethod.join(', '),
        'X-Powered-By': '@ihsangan/valid',
        'X-Response-Time': timeNow() - now
      }
    })
  }
  let url = await parseRequest(request)
  let cache = caches.default
  let response = await cache.match(url)
  if (!response) {
    response = await serveResult(url)
    await cache.put(url, response.clone())
  }
  response = Response.json(response.body, response)
  response.headers.set('X-Response-Time', timeNow() - now)
  return response
}