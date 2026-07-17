import { describe, it, expect } from "vitest";
import {
  env,
  safeEnv,
  EnvError,
  Enum,
  Email,
  URL,
  Port,
  Secret,
} from "../src/index.js";

describe("env-ok-kit", () => {
  it("parses Number and String like env({ PORT: Number, DATABASE: String })", () => {
    const config = env(
      {
        PORT: Number,
        DATABASE: String,
      },
      {
        source: {
          PORT: "3000",
          DATABASE: "postgres://localhost/app",
        },
      },
    );

    expect(config.PORT).toBe(3000);
    expect(config.DATABASE).toBe("postgres://localhost/app");
  });

  it("supports Boolean, Email, URL, Port, Secret, Enum, defaults", () => {
    const config = env(
      {
        DEBUG: Boolean,
        ADMIN: Email,
        SITE: URL,
        PORT: Port,
        JWT_SECRET: Secret,
        NODE_ENV: Enum("development", "production", "test"),
        TIMEOUT: { type: Number, default: 5000 },
        OPTIONAL: { type: String, optional: true },
      },
      {
        source: {
          DEBUG: "yes",
          ADMIN: "a@b.com",
          SITE: "https://example.com",
          PORT: "8080",
          JWT_SECRET: "super-secret",
          NODE_ENV: "production",
        },
      },
    );

    expect(config.DEBUG).toBe(true);
    expect(config.ADMIN).toBe("a@b.com");
    expect(config.SITE).toBe("https://example.com");
    expect(config.PORT).toBe(8080);
    expect(config.JWT_SECRET).toBe("super-secret");
    expect(config.NODE_ENV).toBe("production");
    expect(config.TIMEOUT).toBe(5000);
    expect(config.OPTIONAL).toBeUndefined();
  });

  it("rejects invalid values with EnvError", () => {
    expect(() =>
      env(
        { PORT: Port, ADMIN: Email },
        { source: { PORT: "99999", ADMIN: "nope" } },
      ),
    ).toThrow(EnvError);
  });

  it("safeEnv returns ok/error", () => {
    const ok = safeEnv({ PORT: Number }, { source: { PORT: "1" } });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.data.PORT).toBe(1);

    const bad = safeEnv({ PORT: Number }, { source: {} });
    expect(bad.ok).toBe(false);
  });

  it("supports env key aliases", () => {
    const config = env(
      {
        databaseUrl: { type: String, env: "DATABASE_URL" },
      },
      { source: { DATABASE_URL: "postgres://x" } },
    );
    expect(config.databaseUrl).toBe("postgres://x");
  });
});
