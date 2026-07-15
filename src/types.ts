/** Marker brand for custom type helpers. */
export const TYPE = Symbol.for("env-ok.type");

export type PrimitiveCtor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

export type TypeKind =
  | "string"
  | "number"
  | "boolean"
  | "email"
  | "url"
  | "port"
  | "secret"
  | "enum";

export interface TypeMarker<T = unknown> {
  readonly [TYPE]: TypeKind;
  readonly __output?: T;
  readonly values?: readonly string[];
}

export interface FieldOptions<T = unknown> {
  type: PrimitiveCtor | TypeMarker<T>;
  default?: T;
  optional?: boolean;
  /** Alternate env key */
  env?: string;
}

export type SchemaField =
  | PrimitiveCtor
  | TypeMarker<unknown>
  | FieldOptions<unknown>;

export type EnvSchema = Record<string, SchemaField>;

type InferMarker<T> = T extends TypeMarker<infer O>
  ? O
  : T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends BooleanConstructor
        ? boolean
        : unknown;

export type InferField<F> = F extends FieldOptions<infer T>
  ? F extends { optional: true; default?: undefined }
    ? T | undefined
    : F extends { default: infer D }
      ? T | D
      : T
  : InferMarker<F>;

export type InferEnv<S extends EnvSchema> = {
  [K in keyof S]: InferField<S[K]>;
};

export class EnvError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    const message =
      issues.length === 1
        ? `Invalid environment: ${issues[0]}`
        : `Invalid environment:\n${issues.map((i) => `  - ${i}`).join("\n")}`;
    super(message);
    this.name = "EnvError";
    this.issues = issues;
  }
}
