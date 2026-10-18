import request from 'supertest';
import express from 'express';
import app from '../src/index';
import {
  createUnstableMiddleware,
  resetConfig
} from '../src/middleware/unstableMode';

const buildScopeApp = (scope: 'media' | 'api') => {
  const a = express();
  a.use(createUnstableMiddleware(scope), (req, res) => {
    res.status(200).json({ ok: true });
  });
  return a;
};

describe('Unstable mode admin endpoints', () => {
  afterEach(() => {
    resetConfig();
  });

  describe('GET /admin/unstable-mode-on (no query params)', () => {
    test('enables with default config', async () => {
      const res = await request(app).get('/admin/unstable-mode-on');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        enabled: true,
        errorRate: 0.05,
        endpoints: 'all'
      });
      expect(res.body.failureModes).toEqual(
        expect.arrayContaining(['error500', 'hang', 'dropConnection'])
      );
      expect(res.body.failureModes).toHaveLength(3);
    });
  });

  describe('GET /admin/unstable-mode-on?errorRate=...', () => {
    test('accepts valid errorRate within 0..0.9', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=0.3');
      expect(res.status).toBe(200);
      expect(res.body.errorRate).toBe(0.3);
    });

    test('accepts boundary value 0', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=0');
      expect(res.status).toBe(200);
      expect(res.body.errorRate).toBe(0);
    });

    test('accepts boundary value 0.9', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=0.9');
      expect(res.status).toBe(200);
      expect(res.body.errorRate).toBe(0.9);
    });

    test('rejects errorRate above 0.9 with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=1.5');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/errorRate/);
    });

    test('rejects negative errorRate with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=-0.1');
      expect(res.status).toBe(400);
    });

    test('rejects non-numeric errorRate with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?errorRate=hot');
      expect(res.status).toBe(400);
    });

    test('does not change state when validation fails', async () => {
      await request(app).get('/admin/unstable-mode-on?errorRate=99');
      const status = await request(app).get('/admin/unstable-mode');
      expect(status.body.enabled).toBe(false);
      expect(status.body.errorRate).toBe(0.05);
    });
  });

  describe('GET /admin/unstable-mode-on?failureModes=...', () => {
    test('accepts a single failure mode', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?failureModes=error500');
      expect(res.status).toBe(200);
      expect(res.body.failureModes).toEqual(['error500']);
    });

    test('accepts comma-separated failure modes', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?failureModes=error500,hang');
      expect(res.status).toBe(200);
      expect(res.body.failureModes).toEqual(['error500', 'hang']);
    });

    test('rejects unknown failure modes with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?failureModes=boom');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/failureModes/);
    });

    test('rejects empty failure modes with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?failureModes=');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/unstable-mode-on?endpoints=...', () => {
    test.each(['all', 'images-only', 'apis-only'])('accepts %s', async (value) => {
      const res = await request(app).get(`/admin/unstable-mode-on?endpoints=${value}`);
      expect(res.status).toBe(200);
      expect(res.body.endpoints).toBe(value);
    });

    test('rejects unknown endpoints value with 400', async () => {
      const res = await request(app).get('/admin/unstable-mode-on?endpoints=videos-only');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/endpoints/);
    });
  });

  describe('GET /admin/unstable-mode-off', () => {
    test('resets config to defaults', async () => {
      await request(app).get('/admin/unstable-mode-on?errorRate=0.5&failureModes=hang&endpoints=apis-only');
      const off = await request(app).get('/admin/unstable-mode-off');
      expect(off.status).toBe(200);
      expect(off.body).toMatchObject({
        enabled: false,
        errorRate: 0.05,
        endpoints: 'all'
      });
      expect(off.body.failureModes).toHaveLength(3);
    });
  });

  describe('GET /admin/unstable-mode (status)', () => {
    test('returns full active config + examples', async () => {
      await request(app).get('/admin/unstable-mode-on?errorRate=0.2&endpoints=images-only');
      const res = await request(app).get('/admin/unstable-mode');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        enabled: true,
        errorRate: 0.2,
        endpoints: 'images-only'
      });
      expect(res.body.toggle.onExamples.length).toBeGreaterThan(0);
    });
  });
});

describe('createUnstableMiddleware scope filtering', () => {
  afterEach(() => {
    resetConfig();
  });

  test('with endpoints=apis-only, scope=media never fails (no X-Unstable-Mode header)', async () => {
    const mediaApp = buildScopeApp('media');
    await request(app).get('/admin/unstable-mode-on?errorRate=0.9&failureModes=error500&endpoints=apis-only');
    for (let i = 0; i < 30; i++) {
      const r = await request(mediaApp).get('/anything');
      expect(r.status).toBe(200);
      expect(r.headers['x-unstable-mode']).toBeUndefined();
    }
  });

  test('with endpoints=images-only, scope=api never fails', async () => {
    const apiApp = buildScopeApp('api');
    await request(app).get('/admin/unstable-mode-on?errorRate=0.9&failureModes=error500&endpoints=images-only');
    for (let i = 0; i < 30; i++) {
      const r = await request(apiApp).get('/anything');
      expect(r.status).toBe(200);
      expect(r.headers['x-unstable-mode']).toBeUndefined();
    }
  });

  test('with endpoints=all, scope=media can fail with error500', async () => {
    const mediaApp = buildScopeApp('media');
    await request(app).get('/admin/unstable-mode-on?errorRate=0.9&failureModes=error500&endpoints=all');
    let sawFailure = false;
    for (let i = 0; i < 50; i++) {
      const r = await request(mediaApp).get('/anything');
      if (r.status === 500 && r.headers['x-unstable-mode'] === 'simulated-failure') {
        sawFailure = true;
        break;
      }
    }
    expect(sawFailure).toBe(true);
  });

  test('errorRate=0 never fails even when enabled', async () => {
    const apiApp = buildScopeApp('api');
    await request(app).get('/admin/unstable-mode-on?errorRate=0&failureModes=error500');
    for (let i = 0; i < 30; i++) {
      const r = await request(apiApp).get('/anything');
      expect(r.status).toBe(200);
      expect(r.headers['x-unstable-mode']).toBeUndefined();
    }
  });

  test('disabled middleware always passes through', async () => {
    const apiApp = buildScopeApp('api');
    await request(app).get('/admin/unstable-mode-off');
    for (let i = 0; i < 30; i++) {
      const r = await request(apiApp).get('/anything');
      expect(r.status).toBe(200);
      expect(r.headers['x-unstable-mode']).toBeUndefined();
    }
  });
});
