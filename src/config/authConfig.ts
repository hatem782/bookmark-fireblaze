/**
 * Authentication & Access Control Configuration
 * 
 * - `ALLOW_REGISTRATION`: Controls whether new user account registration is enabled.
 *   - Set to `false` for Personal / Private Mode (only existing accounts can log in).
 *   - Set to `true` for Public Mode (allows anyone to register a new account).
 * 
 * Can be toggled here or via the `VITE_ENABLE_REGISTRATION` environment variable (`true` / `false`).
 */
export const ALLOW_REGISTRATION: boolean =
  import.meta.env.VITE_ENABLE_REGISTRATION !== undefined
    ? import.meta.env.VITE_ENABLE_REGISTRATION === 'true'
    : false;
