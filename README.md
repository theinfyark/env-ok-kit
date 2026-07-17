# env-ok-kit

## Introduction

**env-ok-kit** is a tiny TypeScript environment validator for Node.js.

Instead of:

```js
process.env.PORT
```

Do:

```ts
import { env } from "env-ok-kit";

const config = env({
  PORT: Number,
  DATABASE: String,
});

config.PORT; // number
config.DATABASE; // string
```

Works from **TypeScript and JavaScript** (ESM + CommonJS + `.d.ts`).

## Why this package exists

Reading `process.env` is unsafe: values are always strings, often missing, and easy to mis-parse. **env-ok-kit** gives you a typed config object with clear errors at startup — without a heavy schema framework.

## Installation

```bash
npm install env-ok-kit
```

Requires Node.js 18+.

## Features

- `String` / `Number` / `Boolean` constructors in the schema
- `Enum`
- `Email`
- `URL`
- `Port`
- `Secret`
- Defaults + optional fields
- Zero runtime dependencies
- Excellent TypeScript inference

## Quick Start

### TypeScript

```ts
import { env, Port, Email, Enum, Secret } from "env-ok-kit";

const config = env({
  PORT: Port,
  DATABASE: String,
  DEBUG: Boolean,
  ADMIN_EMAIL: Email,
  NODE_ENV: Enum("development", "test", "production"),
  JWT_SECRET: Secret,
  TIMEOUT_MS: { type: Number, default: 5000 },
});
```

### JavaScript

```js
import { env, Port, Email, Enum, Secret } from "env-ok-kit";

const config = env({
  PORT: Port,
  DATABASE: String,
  DEBUG: Boolean,
  ADMIN_EMAIL: Email,
  NODE_ENV: Enum("development", "test", "production"),
  JWT_SECRET: Secret,
  TIMEOUT_MS: { type: Number, default: 5000 },
});
```

## API Reference

### `env(schema, options?)`

Validates `process.env` (or `options.source`) and returns a typed object.

Throws `EnvError` with `issues: string[]` on failure.

### `safeEnv(schema, options?)`

Returns `{ ok: true, data }` or `{ ok: false, error }`.

### Markers

| Marker | Output |
|--------|--------|
| `String` | `string` |
| `Number` | `number` |
| `Boolean` | `boolean` (`true/false`, `1/0`, `yes/no`, `on/off`) |
| `Email` | `string` email |
| `URL` | `string` URL |
| `Port` | `number` 1–65535 |
| `Secret` | non-empty `string` |
| `Enum("a","b")` | union of values |

### Field options

```ts
{
  type: Number,
  default: 3000,
  optional: true,
  env: "HTTP_PORT", // read alternate key
}
```

## Examples

```ts
const config = env({
  PORT: Number,
  DATABASE: String,
});
```

## Advanced Examples

```ts
import { env, Enum, Port } from "env-ok-kit";

const config = env(
  {
    port: { type: Port, env: "PORT", default: 3000 },
    mode: Enum("dev", "prod"),
  },
  {
    source: { PORT: "8080", mode: "prod" }, // useful in tests
  },
);
```

## Framework Integration

Call `env()` once at process startup (Express, Fastify, Hono, NestJS, workers):

```ts
// config.ts
export const config = env({ PORT: Number, DATABASE: String });

// server.ts
import { config } from "./config.js";
app.listen(config.PORT);
```

## TypeScript Usage

Schema inference is built-in:

```ts
const config = env({ PORT: Number, FLAG: Boolean });
// typeof config.PORT === number
```

## Error Handling

```ts
import { env, EnvError } from "env-ok-kit";

try {
  env({ PORT: Number });
} catch (err) {
  if (err instanceof EnvError) {
    console.error(err.issues);
    process.exit(1);
  }
  throw err;
}
```

## Performance

Single synchronous pass at startup. No dependencies. Suitable for serverless cold starts.

## Best Practices

- Fail fast at boot — don’t read `process.env` ad hoc later
- Use `Port` / `Email` / `Secret` instead of plain `String` when possible
- Keep secrets out of logs
- Prefer `safeEnv` only when you need custom handling

## FAQ

**Does it load `.env` files?**  
No — use `dotenv` / your platform secrets, then call `env()`.

**Can I use CommonJS?**  
Yes: `const { env } = require("env-ok-kit")`.

**How is this different from env-safe-plus?**  
`env-ok-kit` is TypeScript-first with constructor/`Enum` schema style and stronger inference. `env-safe-plus` uses string type names (`"number"`).

## Migration Guide

### From raw `process.env`

Replace `Number(process.env.PORT)` / checks with one `env({ ... })` call.

### SemVer

Breaking changes only in major versions (`CHANGELOG.md`).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `PORT is missing` | Export the var or add `default` |
| Types are `unknown` | Ensure imports from `env-ok-kit` and TS 5+ |
| Boolean not parsing | Use `true/false`, `1/0`, `yes/no`, `on/off` |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
