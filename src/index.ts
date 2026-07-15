import { Enum, Email, URL, Url, Port, Secret, BooleanType } from "./markers.js";

export { env, safeEnv } from "./env.js";
export type { EnvOptions } from "./env.js";
export { Enum, Email, URL, Url, Port, Secret, BooleanType };
/** Explicit boolean marker (native `Boolean` also works in schemas). */
export { BooleanType as Bool };
export { EnvError, TYPE } from "./types.js";
export type {
  EnvSchema,
  SchemaField,
  FieldOptions,
  TypeMarker,
  InferEnv,
  InferField,
} from "./types.js";
