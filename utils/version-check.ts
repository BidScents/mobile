/**
 * Compares two semantic version strings.
 * Returns:
 * - 1 if v1 > v2
 * - -1 if v1 < v2
 * - 0 if v1 === v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const val1 = v1Parts[i] || 0;
    const val2 = v2Parts[i] || 0;

    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }

  return 0;
};

/**
 * Checks if the current version is lower than the minimum required version.
 * @param currentVersion The installed app version (e.g., '1.0.0')
 * @param minVersion The minimum required version from the backend (e.g., '1.0.2')
 * @returns true if update is required
 */
export const isUpdateNeeded = (currentVersion: string, minVersion: string): boolean => {
  return compareVersions(currentVersion, minVersion) === -1;
};
