# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-16

### Changed

- Version bump for npm registry publish

## [1.0.0] - 2026-07-15

### Added
- TypeScript environment validator with `env({ PORT: Number, DATABASE: String })`
- Markers: Enum, Boolean (native), Email, URL, Port, Secret
- Defaults, optional fields, env key aliases
- `safeEnv()` non-throwing helper
- Dual ESM/CJS + `.d.ts` exports for JS and TS consumers
