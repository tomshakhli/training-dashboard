const ORIGINS = ['https://tomshakhli.github.io','http://localhost:3000','http://localhost:5173'];
const BASE = 'https://intervals.icu';

function cors(origin) {
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
    var origin = request.headers.get('Origin') || '';
    if (!ORIGINS.includes(origin)) {
      return new Response('Forbidden', {status: 403});
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {status: 204, headers: cors(origin)});
    }
    var url = new URL(request.url);
    var target = BASE + url.pathname + url.search;
    var h = new Headers();
    var auth = request.headers.get('Authorization');
    if (auth) h.set('Authorization', auth);
    h.set('Accept', 'application/json');
    try {
      var resp = await fetch(target, {method: request.method, headers: h});
      var rh = new Headers(resp.headers);
      rh.set('Access-Control-Allow-Origin', origin);
      rh.set('Access-Control-Allow-Credentials', 'true');
      return new Response(resp.body, {status: resp.status, headers: rh});
    } catch (e) {
      return new Response(e.message, {status: 502, headers: {'Access-Control-Allow-Origin': origin}});
    }
  }
};
