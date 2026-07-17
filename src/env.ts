import {
  TYPE,
  type EnvSchema,
  type FieldOptions,
  type InferEnv,
  type PrimitiveCtor,
  type SchemaField,
  type TypeKind,
  type TypeMarker,
  EnvError,
} from "./types.js";

const TRUE = new Set(["true", "1", "yes", "y", "on"]);
const FALSE = new Set(["false", "0", "no", "n", "off"]);

function isMarker(value: unknown): value is TypeMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    TYPE in value &&
    typeof (value as TypeMarker)[TYPE] === "string"
  );
}

function isCtor(value: unknown): value is PrimitiveCtor {
  return value === String || value === Number || value === Boolean;
}

function normalizeField(field: SchemaField): FieldOptions {
  if (isCtor(field) || isMarker(field)) {
    return { type: field };
  }
  if (field && typeof field === "object" && "type" in field) {
    return field as FieldOptions;
  }
  throw new EnvError(["schema fields must be String/Number/Boolean, a marker, or { type, ... }"]);
}

function kindOf(type: FieldOptions["type"]): TypeKind {
  if (type === String) return "string";
  if (type === Number) return "number";
  if (type === Boolean) return "boolean";
  if (isMarker(type)) return type[TYPE];
  throw new EnvError(["unsupported field type"]);
}

function isEmpty(raw: string | undefined): boolean {
  return raw === undefined || raw.trim() === "";
}

function coerce(
  key: string,
  raw: string,
  field: FieldOptions,
): unknown {
  const kind = kindOf(field.type);
  const value = raw.trim();

  switch (kind) {
    case "string":
      return value;
    case "secret":
      if (!value) throw `${key} must be a non-empty secret`;
      return value;
    case "number": {
      const n = Number(value);
      if (!Number.isFinite(n)) throw `${key} must be a number (got "${raw}")`;
      return n;
    }
    case "port": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 65535) {
        throw `${key} must be a valid port 1–65535 (got "${raw}")`;
      }
      return n;
    }
    case "boolean": {
      const lower = value.toLowerCase();
      if (TRUE.has(lower)) return true;
      if (FALSE.has(lower)) return false;
      throw `${key} must be a boolean (got "${raw}")`;
    }
    case "email": {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw `${key} must be a valid email (got "${raw}")`;
      }
      return value;
    }
    case "url": {
      try {
        // Validate only
        new URL(value);
        return value;
      } catch {
        throw `${key} must be a valid URL (got "${raw}")`;
      }
    }
    case "enum": {
      const marker = field.type as TypeMarker;
      const values = marker.values ?? [];
      if (!values.includes(value)) {
        throw `${key} must be one of: ${values.join(", ")} (got "${raw}")`;
      }
      return value;
    }
    default:
      throw `${key} has unsupported type`;
  }
}

export interface EnvOptions {
  /** Defaults to process.env */
  source?: Record<string, string | undefined>;
}

/**
 * Validate and coerce environment variables.
 *
 * @example
 * ```ts
 * import { env, Port, Email, Enum } from "env-ok-kit";
 *
 * const config = env({
 *   PORT: Number,
 *   DATABASE: String,
 *   ADMIN: Email,
 *   NODE_ENV: Enum("development", "production"),
 * });
 * ```
 */
export function env<S extends EnvSchema>(
  schema: S,
  options: EnvOptions = {},
): InferEnv<S> {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new EnvError(["schema must be a non-null object"]);
  }

  const source = options.source ?? process.env;
  const result: Record<string, unknown> = {};
  const issues: string[] = [];

  for (const [key, rawField] of Object.entries(schema)) {
    let field: FieldOptions;
    try {
      field = normalizeField(rawField);
    } catch (err) {
      if (err instanceof EnvError) {
        issues.push(...err.issues.map((i) => `${key}: ${i}`));
        continue;
      }
      throw err;
    }

    const envKey = field.env ?? key;
    const raw = source[envKey];
    const empty = isEmpty(raw);
    const hasDefault = Object.prototype.hasOwnProperty.call(field, "default");

    if (empty) {
      if (hasDefault) {
        result[key] = field.default;
        continue;
      }
      if (field.optional) {
        result[key] = undefined;
        continue;
      }
      issues.push(`${key} is missing or empty`);
      continue;
    }

    try {
      result[key] = coerce(key, raw as string, field);
    } catch (err) {
      issues.push(typeof err === "string" ? err : String(err));
    }
  }

  if (issues.length > 0) throw new EnvError(issues);
  return result as InferEnv<S>;
}

/**
 * Same as `env()` but returns `{ ok, data }` / `{ ok, error }` instead of throwing.
 */
export function safeEnv<S extends EnvSchema>(
  schema: S,
  options: EnvOptions = {},
): { ok: true; data: InferEnv<S> } | { ok: false; error: EnvError } {
  try {
    return { ok: true, data: env(schema, options) };
  } catch (error) {
    if (error instanceof EnvError) return { ok: false, error };
    throw error;
  }
}
