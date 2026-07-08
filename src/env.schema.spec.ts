// src/env.schema.spec.ts
import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('returns a typed Env when all required vars are valid', () => {
    const env = parseEnv({
      API_BASE_URL: 'https://api.example.com',
      SITE_URL: 'https://example.com',
      PORT: '4000',
    } as NodeJS.ProcessEnv);

    expect(env).toEqual({
      API_BASE_URL: 'https://api.example.com',
      SITE_URL: 'https://example.com',
      PORT: 4000,
    });
  });

  it('defaults PORT to 4000 when missing', () => {
    const env = parseEnv({
      API_BASE_URL: 'https://api.example.com',
      SITE_URL: 'https://example.com',
    } as NodeJS.ProcessEnv);

    expect(env.PORT).toBe(4000);
  });

  it('throws a readable error when API_BASE_URL is missing', () => {
    expect(() => parseEnv({ SITE_URL: 'https://example.com' } as NodeJS.ProcessEnv)).toThrow(
      /API_BASE_URL/,
    );
  });

  it('throws when API_BASE_URL is not a valid URL', () => {
    expect(() =>
      parseEnv({ API_BASE_URL: 'not-a-url', SITE_URL: 'https://example.com' } as NodeJS.ProcessEnv),
    ).toThrow(/API_BASE_URL/);
  });
});
