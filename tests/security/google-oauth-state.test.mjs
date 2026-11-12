import assert from 'node:assert/strict';

// Run against a local development server: node tests/security/google-oauth-state.test.mjs
const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
const get = (path, cookie) => fetch(base + path, { redirect: 'manual', headers: cookie ? { cookie } : {}, signal: AbortSignal.timeout(15000) });
const start = await get('/api/auth/google');
assert.equal(start.status, 307);
const authorization = new URL(start.headers.get('location'));
assert.equal(authorization.origin, 'https://accounts.google.com');
assert.equal(authorization.searchParams.get('redirect_uri'), `${base}/api/auth/callback/google`);
const state = authorization.searchParams.get('state');
assert.match(state, /^[A-Za-z0-9_-]{43}$/);
const setCookie = start.headers.get('set-cookie');
assert.match(setCookie, /google_oauth_state=/);
assert.match(setCookie, /HttpOnly/i);
assert.match(setCookie, /SameSite=lax/i);
assert.match(setCookie, /Max-Age=600/i);
assert.match(setCookie, /Path=\/api\/auth\//i);
const cookie = setCookie.split(';')[0];
assert.equal(cookie.slice(cookie.indexOf('=') + 1), state);
const second = await get('/api/auth/google');
assert.notEqual(new URL(second.headers.get('location')).searchParams.get('state'), state);
const missing = await get('/api/auth/callback/google?code=not-a-real-code');
assert.equal(new URL(missing.headers.get('location')).searchParams.get('error'), 'invalid_oauth_state');
assert.match(missing.headers.get('set-cookie'), /Max-Age=0/i);
const mismatch = await get('/api/auth/callback/google?code=not-a-real-code&state=' + 'A'.repeat(43), cookie);
assert.equal(new URL(mismatch.headers.get('location')).searchParams.get('error'), 'invalid_oauth_state');
const denied = await get('/api/auth/callback/google?error=access_denied&state=' + state, cookie);
assert.equal(new URL(denied.headers.get('location')).searchParams.get('error'), 'access_denied');
assert.match(denied.headers.get('set-cookie'), /Max-Age=0/i);
const legacyStart = await get('/api/auth/google?callback=%2Fapi%2Fauth%2Fgoogle%2Fcallback');
const legacyUrl = new URL(legacyStart.headers.get('location'));
assert.equal(legacyUrl.searchParams.get('redirect_uri'), `${base}/api/auth/google/callback`);
const legacyState = legacyUrl.searchParams.get('state');
const legacyCookie = legacyStart.headers.get('set-cookie').split(';')[0];
const legacyDenied = await get('/api/auth/google/callback?error=access_denied&state=' + legacyState, legacyCookie);
assert.equal(new URL(legacyDenied.headers.get('location')).searchParams.get('error'), 'access_denied');
const arbitrary = await get('/api/auth/google?callback=%2Fevil');
assert.equal(new URL(arbitrary.headers.get('location')).searchParams.get('redirect_uri'), `${base}/api/auth/callback/google`);
const secureStart = await fetch(base + '/api/auth/google', {
  redirect: 'manual',
  headers: { 'x-forwarded-proto': 'https' },
  signal: AbortSignal.timeout(15000),
});
assert.match(secureStart.headers.get('set-cookie'), /;\s*Secure/i);
console.log('OAuth live checks passed: unpredictable state, cookie flags, missing/mismatched state rejection, successful state validation, cookie clearing, both callbacks, and callback allowlist.');
