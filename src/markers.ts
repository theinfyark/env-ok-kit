import { TYPE, type TypeMarker } from "./types.js";

/** Valid email address */
export const Email: TypeMarker<string> = {
  [TYPE]: "email",
};

/** Valid URL */
export const Url: TypeMarker<string> = {
  [TYPE]: "url",
};

/** Alias for Url */
export const URL = Url;

/** TCP port 1–65535 (returns number) */
export const Port: TypeMarker<number> = {
  [TYPE]: "port",
};

/** Non-empty secret string (passwords, tokens) */
export const Secret: TypeMarker<string> = {
  [TYPE]: "secret",
};

/**
 * Explicit boolean marker.
 * Native `Boolean` constructor also works in schemas.
 */
export const BooleanType: TypeMarker<boolean> = {
  [TYPE]: "boolean",
};

/** Enum of allowed string values */
export function Enum<const T extends readonly string[]>(
  ...values: T
): TypeMarker<T[number]> {
  if (values.length === 0) {
    throw new Error("Enum() requires at least one value");
  }
  return {
    [TYPE]: "enum",
    values,
  };
}
