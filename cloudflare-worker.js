const ORIGINS = ['https://tomshakhli.github.io','http://localhost:3000','http://localhost:5173','http://127.0.0.1:5500','null'];
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

    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.arrayBuffer();
    }

    const h = new Headers();
    const auth = request.headers.get('Authorization');
    if (auth) h.set('Authorization', auth);
    if (body && body.byteLength > 0) {
      h.set('Content-Type', 'application/json');
      h.set('Content-Length', body.byteLength.toString());
    }
    h.set('Accept', 'application/json');

    try {
      const resp = await fetch(target, {
        method: request.method,
        headers: h,
        body: body && body.byteLength > 0 ? body : undefined
      });
      const respBody = await resp.text();
      const rh = new Headers();
      rh.set('Access-Control-Allow-Origin', origin);
      rh.set('Access-Control-Allow-Credentials', 'true');
      rh.set('Content-Type', resp.headers.get('Content-Type') || 'application/json');
      return new Response(respBody, { status: resp.status, headers: rh });
    } catch (e) {
      return new Response(e.message, { status: 502, headers: { 'Access-Control-Allow-Origin': origin } });
    }
  }
};
