# Changelog

All notable changes to this project are documented in this file.

## [1.2.1] - 2026-04-04

### Added

- Added integration test support context with shared app wiring, builders, and repository mock reset utilities.
- Added shared unit test support fixtures for user repository mocks, user entities, user model-like records, and express request/response helpers.

### Changed

- Split monolithic API integration test coverage into focused files by domain (`system`, `auth`, `users`) for easier navigation and maintenance.
- Standardized Jest globals imports and mock typing patterns across test files to improve editor diagnostics and readability.

### Refactored

- Reduced duplicated setup code in application and infrastructure unit tests by reusing support helpers.

## [1.2.0] - 2026-04-04

### Added

- Added logout endpoint and token blacklist persistence with revoked token storage.
- Added refresh token replay protection and rotation tests.
- Added rate limiting for register and refresh endpoints.
- Added token blacklist cleanup background job with configurable interval.
- Added stricter auth and user validation schemas plus extended security-focused unit/integration tests.

### Changed

- Updated register endpoint behavior to return created user data on success and explicit conflict on duplicate email.
- Strengthened JWT validation with issuer, audience, token type, and jti handling across token service and passport strategies.
- Hardened logging and request context handling with sensitive data redaction and correlation ID sanitization.
- Improved Docker runtime hardening and compose security defaults.

### Fixed

- Normalized email handling and conflict handling in repository operations.
- Improved consistency in test request IDs and configuration credentials.

### Security

- Reduced account takeover and token replay risk with blacklist-based revocation.
- Reduced abuse risk by enforcing stricter validation and rate limits on authentication flows.

## [1.1.0] - 2026-04-02

### Added

- Implemented authentication and authorization with JWT.
- Added user management features with CRUD operations and validation.
- Added an admin endpoint to retrieve the user list.
- Added integration and unit tests for auth and registration flows.
- Added comprehensive logging for registration and user management.
- Implemented HTML documentation viewer with search and static file serving.
- Implemented centralized project naming customization via `PROJECT_SLUG` metadata sync.

### Changed

- Improved HTML viewer layout and responsive search controls.
- Updated Jest TypeScript setup and test-specific TypeScript configuration.
- Updated TypeScript module settings for Node16 compatibility.
- Improved environment configuration and seeding behavior with required variables.
- Translated documentation and code comments to Spanish and improved documentation structure.

### Fixed

- Updated Swagger API title and app naming consistency in configuration files.
- Improved error logging and updated admin seed/email references.
- Adjusted integration test app import consistency.
- Cleaned Jest config warnings (`globals` to `transform`) and enabled `isolatedModules` for tests.

### Refactored

- Removed an unused migration file and related imports.

### Security

- Upgraded `bcrypt` to `^6.0.0` to remove vulnerable transitive dependencies (`@mapbox/node-pre-gyp` and `tar`).

## [1.0.0] - 2026-03-31

### Added

- Initial project structure and baseline template.
