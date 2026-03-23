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

    if (url.pathname === '/debug') {
      const body = await request.text();
      return new Response(JSON.stringify({ method: request.method, bodyLength: body.length, body: body }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin }
      });
    }

    const target = BASE + url.pathname + url.search;

    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.arrayBuffer();
    }

    const newHeaders = new Headers();
    const auth = request.headers.get('Authorization');
    if (auth) newHeaders.set('Authorization', auth);
    if (body && body.byteLength > 0) {
      newHeaders.set('Content-Type', 'application/json');
      newHeaders.set('Content-Length', body.byteLength.toString());
    }
    newHeaders.set('Accept', 'application/json');

    try {
      const resp = await fetch(target, {
        method: request.method,
        headers: newHeaders,
        body: body && body.byteLength > 0 ? body : undefined
      });
      const respBody = await resp.text();
      const responseHeaders = new Headers();
      responseHeaders.set('Access-Control-Allow-Origin', origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      responseHeaders.set('Content-Type', resp.headers.get('Content-Type') || 'application/json');
      return new Response(respBody, { status: resp.status, headers: responseHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin }
      });
    }
  }
};
