# Changelog

All notable changes to this project are documented in this file.

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
