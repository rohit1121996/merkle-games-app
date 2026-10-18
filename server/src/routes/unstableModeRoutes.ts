import express, { Request, Response, Router } from 'express';
import {
  ALL_FAILURE_MODES,
  DEFAULT_ENDPOINTS,
  DEFAULT_ERROR_RATE,
  EndpointScope,
  FailureMode,
  MAX_ERROR_RATE,
  getConfig,
  resetConfig,
  setConfig
} from '../middleware/unstableMode';

const router: Router = express.Router();

const VALID_ENDPOINTS: readonly EndpointScope[] =
  ['all', 'images-only', 'apis-only'];

interface ParsedOnConfig {
  errorRate: number;
  failureModes: FailureMode[];
  endpoints: EndpointScope;
}

type ParseResult =
  | { ok: true; value: ParsedOnConfig }
  | { ok: false; error: string };

const parseOnQuery = (q: Request['query']): ParseResult => {
  let errorRate = DEFAULT_ERROR_RATE;
  if (q.errorRate !== undefined) {
    const raw = String(q.errorRate);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > MAX_ERROR_RATE) {
      return {
        ok: false,
        error: `errorRate must be a number between 0 and ${MAX_ERROR_RATE}`
      };
    }
    errorRate = n;
  }

  let failureModes: FailureMode[] = [...ALL_FAILURE_MODES];
  if (q.failureModes !== undefined) {
    const parts = String(q.failureModes)
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const invalid = parts.filter(
      p => !ALL_FAILURE_MODES.includes(p as FailureMode)
    );
    if (parts.length === 0 || invalid.length > 0) {
      return {
        ok: false,
        error: `failureModes must be a non-empty comma list of: ${ALL_FAILURE_MODES.join(', ')}`
      };
    }
    failureModes = parts as FailureMode[];
  }

  let endpoints: EndpointScope = DEFAULT_ENDPOINTS;
  if (q.endpoints !== undefined) {
    const raw = String(q.endpoints);
    if (!VALID_ENDPOINTS.includes(raw as EndpointScope)) {
      return {
        ok: false,
        error: `endpoints must be one of: ${VALID_ENDPOINTS.join(', ')}`
      };
    }
    endpoints = raw as EndpointScope;
  }

  return { ok: true, value: { errorRate, failureModes, endpoints } };
};

router.get('/unstable-mode-on', (req: Request, res: Response) => {
  const parsed = parseOnQuery(req.query);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const next = setConfig({ enabled: true, ...parsed.value });
  res.json({
    enabled: next.enabled,
    errorRate: next.errorRate,
    failureModes: next.failureModes,
    endpoints: next.endpoints,
    message: 'Unstable mode is now ON'
  });
});

router.get('/unstable-mode-off', (req: Request, res: Response) => {
  const next = resetConfig();
  res.json({
    enabled: next.enabled,
    errorRate: next.errorRate,
    failureModes: next.failureModes,
    endpoints: next.endpoints,
    message: 'Unstable mode is now OFF (config reset to defaults)'
  });
});

router.get('/unstable-mode', (req: Request, res: Response) => {
  const c = getConfig();
  res.json({
    enabled: c.enabled,
    errorRate: c.errorRate,
    failureModes: c.failureModes,
    endpoints: c.endpoints,
    description:
      'When enabled, REST (/api/v1), GraphQL (/graphql) and media (/media) requests have a configurable chance of failing. Each failure is randomly one of the configured failure modes. Documentation, health, and admin endpoints are never affected. Configure via query params on /admin/unstable-mode-on (errorRate, failureModes, endpoints).',
    toggle: {
      on: '/admin/unstable-mode-on',
      onExamples: [
        '/admin/unstable-mode-on?errorRate=0.3',
        '/admin/unstable-mode-on?failureModes=error500,hang',
        '/admin/unstable-mode-on?endpoints=images-only',
        '/admin/unstable-mode-on?errorRate=0.5&failureModes=error500&endpoints=apis-only'
      ],
      off: '/admin/unstable-mode-off',
      status: '/admin/unstable-mode'
    }
  });
});

export default router;
