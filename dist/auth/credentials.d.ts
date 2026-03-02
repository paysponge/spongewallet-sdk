import { type Credentials } from "../types/schemas.js";
export type { Credentials };
/**
 * Get the credentials directory path
 */
export declare function getCredentialsDir(): string;
/**
 * Get the credentials file path
 */
export declare function getCredentialsPath(): string;
/**
 * Load credentials from disk
 * @returns Credentials if found and valid, null otherwise
 */
export declare function loadCredentials(): Credentials | null;
/**
 * Save credentials to disk
 */
export declare function saveCredentials(credentials: Credentials): void;
/**
 * Delete credentials from disk
 */
export declare function deleteCredentials(): void;
/**
 * Check if credentials exist
 */
export declare function hasCredentials(): boolean;
/**
 * Get API key from environment variable or credentials file
 * @param envVarName Name of the environment variable to check (default: SPONGE_API_KEY)
 */
export declare function getApiKey(envVarName?: string): string | null;
/**
 * Get agent ID from credentials file
 */
export declare function getAgentId(): string | null;
//# sourceMappingURL=credentials.d.ts.map