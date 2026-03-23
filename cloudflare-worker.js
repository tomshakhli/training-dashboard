const ORIGINS = ['https://tomshakhli.github.io','http://localhost:3000','http://localhost:5173','null'];
const BASE = 'https://intervals.icu';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    if (!ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const target = BASE + url.pathname + url.search;

    const newHeaders = new Headers();
    const auth = request.headers.get('Authorization');
    if (auth) newHeaders.set('Authorization', auth);
    const contentType = request.headers.get('Content-Type');
    if (contentType) newHeaders.set('Content-Type', contentType);
    newHeaders.set('Accept', 'application/json');

    const newRequest = new Request(target, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
    });

    try {
      const resp = await fetch(newRequest);
      const responseHeaders = new Headers(resp.headers);
      responseHeaders.set('Access-Control-Allow-Origin', origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      return new Response(resp.body, { status: resp.status, headers: responseHeaders });
    } catch (e) {
      return new Response(e.message, { status: 502, headers: { 'Access-Control-Allow-Origin': origin } });
    }
  }
};
