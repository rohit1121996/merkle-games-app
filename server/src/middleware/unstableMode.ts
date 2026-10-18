import { Request, Response, NextFunction, RequestHandler } from 'express';

export type FailureMode = 'error500' | 'hang' | 'dropConnection';
export type EndpointScope = 'all' | 'images-only' | 'apis-only';
export type MiddlewareScope = 'media' | 'api';

export interface UnstableModeConfig {
  enabled: boolean;
  errorRate: number;
  failureModes: FailureMode[];
  endpoints: EndpointScope;
}

export const ALL_FAILURE_MODES: readonly FailureMode[] =
  ['error500', 'hang', 'dropConnection'];
export const MAX_ERROR_RATE = 0.9;
export const DEFAULT_ERROR_RATE = 0.05;
export const DEFAULT_ENDPOINTS: EndpointScope = 'all';

const HANG_MIN_MS = 5000;
const HANG_MAX_MS = 10000;

const defaultConfig = (): UnstableModeConfig => ({
  enabled: false,
  errorRate: DEFAULT_ERROR_RATE,
  failureModes: [...ALL_FAILURE_MODES],
  endpoints: DEFAULT_ENDPOINTS
});

let config: UnstableModeConfig = {
  ...defaultConfig(),
  enabled: process.env.UNSTABLE_MODE === 'true'
};

export const getConfig = (): Readonly<UnstableModeConfig> => config;

export const setConfig = (
  patch: Partial<UnstableModeConfig>
): Readonly<UnstableModeConfig> => {
  config = { ...config, ...patch };
  return config;
};

export const resetConfig = (): Readonly<UnstableModeConfig> => {
  config = defaultConfig();
  return config;
};

export const isUnstableEnabled = (): boolean => config.enabled;
export const getFailureRate = (): number => config.errorRate;

const scopeAllowed = (
  scope: MiddlewareScope,
  endpoints: EndpointScope
): boolean => {
  if (endpoints === 'all') return true;
  if (endpoints === 'images-only') return scope === 'media';
  return scope === 'api';
};

export const createUnstableMiddleware = (
  scope: MiddlewareScope
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!config.enabled) return next();
    if (!scopeAllowed(scope, config.endpoints)) return next();
    if (config.errorRate <= 0) return next();
    if (Math.random() >= config.errorRate) return next();
    if (config.failureModes.length === 0) return next();

    const mode =
      config.failureModes[
        Math.floor(Math.random() * config.failureModes.length)
      ];

    switch (mode) {
      case 'error500':
        res.setHeader('X-Unstable-Mode', 'simulated-failure');
        res.status(500).json({
          error: {
            message: 'Simulated Internal Server Error (unstable mode)',
            status: 500,
            simulated: true,
            source: 'unstable-mode'
          }
        });
        return;
      case 'hang': {
        const delay = HANG_MIN_MS + Math.random() * (HANG_MAX_MS - HANG_MIN_MS);
        setTimeout(() => {
          if (!res.headersSent) {
            res.setHeader('X-Unstable-Mode', 'simulated-failure');
            res.status(504).json({
              error: {
                message: 'Simulated Gateway Timeout (unstable mode)',
                status: 504,
                simulated: true,
                source: 'unstable-mode'
              }
            });
          }
        }, delay);
        return;
      }
      case 'dropConnection':
        // No marker possible — the socket is destroyed before any bytes are sent.
        req.socket.destroy();
        return;
    }
  };
};
