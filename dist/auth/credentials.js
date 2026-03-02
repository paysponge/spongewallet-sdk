import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { CredentialsSchema } from "../types/schemas.js";
const CREDENTIALS_DIR = ".spongewallet";
const CREDENTIALS_FILE = "credentials.json";
/**
 * Get the credentials directory path
 */
export function getCredentialsDir() {
    return path.join(os.homedir(), CREDENTIALS_DIR);
}
/**
 * Get the credentials file path
 */
export function getCredentialsPath() {
    return path.join(getCredentialsDir(), CREDENTIALS_FILE);
}
/**
 * Ensure the credentials directory exists
 */
function ensureCredentialsDir() {
    const dir = getCredentialsDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
}
/**
 * Load credentials from disk
 * @returns Credentials if found and valid, null otherwise
 */
export function loadCredentials() {
    const credPath = getCredentialsPath();
    if (!fs.existsSync(credPath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(credPath, "utf-8");
        const data = JSON.parse(content);
        const result = CredentialsSchema.safeParse(data);
        if (!result.success) {
            console.warn("Invalid credentials file, ignoring");
            return null;
        }
        return result.data;
    }
    catch (error) {
        console.warn("Failed to read credentials file:", error);
        return null;
    }
}
/**
 * Save credentials to disk
 */
export function saveCredentials(credentials) {
    ensureCredentialsDir();
    const credPath = getCredentialsPath();
    // Validate before saving
    const validated = CredentialsSchema.parse(credentials);
    fs.writeFileSync(credPath, JSON.stringify(validated, null, 2), {
        mode: 0o600, // Read/write for owner only
    });
}
/**
 * Delete credentials from disk
 */
export function deleteCredentials() {
    const credPath = getCredentialsPath();
    if (fs.existsSync(credPath)) {
        fs.unlinkSync(credPath);
    }
}
/**
 * Check if credentials exist
 */
export function hasCredentials() {
    return fs.existsSync(getCredentialsPath());
}
/**
 * Get API key from environment variable or credentials file
 * @param envVarName Name of the environment variable to check (default: SPONGE_API_KEY)
 */
export function getApiKey(envVarName = "SPONGE_API_KEY") {
    // Check environment variable first
    const envKey = process.env[envVarName];
    if (envKey) {
        return envKey;
    }
    // Fall back to credentials file
    const creds = loadCredentials();
    return creds?.apiKey ?? null;
}
/**
 * Get agent ID from credentials file
 */
export function getAgentId() {
    const creds = loadCredentials();
    return creds?.agentId ?? null;
}
//# sourceMappingURL=credentials.js.map