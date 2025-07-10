import { regEx } from '../../../util/regex';
import type { GenericVersion } from '../generic';
import { GenericVersioningApi } from '../generic';
import type { VersioningApi } from '../types';

export const id = 'apk';
export const displayName = 'Alpine Package Keeper (APK)';
export const urls = [
  'https://wiki.alpinelinux.org/wiki/Package_policies',
  'https://wiki.alpinelinux.org/wiki/Alpine_Package_Keeper#Package_pinning',
];
export const supportsRanges = false;

export interface ApkVersion extends GenericVersion {
  /**
   * version is the main version part: it defines the version of origin software
   * that was packaged.
   */
  version: string;
  /**
   * releaseString is used to distinguish between different versions of packaging for the
   * same upstream version.
   */
  releaseString: string;
}

class ApkVersioningApi extends GenericVersioningApi {
  /**
   * Parse APK version format: version-release
   * Examples:
   * - 2.39.0-r0
   * - 2.39.0_rc1-r0
   * - 6.5_p20250503-r0
   */
  protected _parse(version: string): ApkVersion | null {
    let versionPart: string;
    let releasePart = '';
    const releaseIndex = version.indexOf('-');

    if (releaseIndex >= 0) {
      versionPart = version.slice(0, releaseIndex);
      releasePart = version.slice(releaseIndex + 1);
    } else {
      versionPart = version;
    }

    // Extract numeric parts for comparison
    const release = [...version.matchAll(regEx(/\d+/g))].map((m) =>
      parseInt(m[0], 10),
    );

    return {
      version: versionPart,
      releaseString: releasePart,
      release,
    };
  }

  /**
   * Compare two APK versions according to Alpine Linux rules
   * 1. Compare version parts
   * 2. Compare release parts
   */
  protected override _compare(version: string, other: string): number {
    const parsed1 = this._parse(version);
    const parsed2 = this._parse(other);

    if (!(parsed1 && parsed2)) {
      return 1;
    }

    // Compare version parts
    const versionCompare = this._compareVersionParts(
      parsed1.version,
      parsed2.version,
    );
    if (versionCompare !== 0) {
      return versionCompare;
    }

    // Compare release parts
    return this._compareVersionParts(
      parsed1.releaseString,
      parsed2.releaseString,
    );
  }

  /**
   * Compare version parts using APK's version comparison rules
   * This follows the same logic as RPM version comparison
   */
  private _compareVersionParts(v1: string, v2: string): number {
    if (v1 === v2) {
      return 0;
    }

    const alphaNumPattern = regEx(/([a-zA-Z]+)|(\d+)|(~)/g);
    const matchesv1 = v1.match(alphaNumPattern) ?? [];
    const matchesv2 = v2.match(alphaNumPattern) ?? [];
    const matches = Math.min(matchesv1.length, matchesv2.length);

    for (let i = 0; i < matches; i++) {
      const matchv1 = matchesv1[i];
      const matchv2 = matchesv2[i];

      // Compare tildes (pre-release versions)
      if (matchv1?.startsWith('~') || matchv2?.startsWith('~')) {
        if (!matchv1?.startsWith('~')) {
          return 1;
        }
        if (!matchv2?.startsWith('~')) {
          return -1;
        }
      }

      // Compare numbers vs strings
      if (matchv1 && /^\d+$/.test(matchv1)) {
        if (!matchv2 || !/^\d+$/.test(matchv2)) {
          return 1; // numbers are greater than letters
        }
        const num1 = parseInt(matchv1, 10);
        const num2 = parseInt(matchv2, 10);
        if (num1 !== num2) {
          return num1 - num2;
        }
      } else if (matchv2 && /^\d+$/.test(matchv2)) {
        return -1; // letters are less than numbers
      } else {
        // Both are strings, compare lexicographically
        if (matchv1 !== matchv2) {
          return matchv1.localeCompare(matchv2);
        }
      }
    }

    // segments were all the same, but separators were different
    if (matchesv1.length === matchesv2.length) {
      return 0;
    }

    // If there is a tilde in a segment past the minimum number of segments, find it
    if (matchesv1.length > matches && matchesv1[matches].startsWith('~')) {
      return -1;
    }

    if (matchesv2.length > matches && matchesv2[matches].startsWith('~')) {
      return 1;
    }

    // whichever has the most segments wins
    return matchesv1.length > matchesv2.length ? 1 : -1;
  }

  override isValid(version: string): boolean {
    const parsed = this._parse(version);
    if (!parsed) {
      return false;
    }
    // APK versions must start with a number
    return /^\d/.test(parsed.version);
  }

  override isStable(version: string): boolean {
    const parsed = this._parse(version);
    if (!parsed) {
      return false;
    }
    // Consider versions without _rc# pattern as stable
    const rcPattern = regEx(/_rc\d+/);
    return (
      !rcPattern.test(parsed.version) && !rcPattern.test(parsed.releaseString)
    );
  }
}

export const api: VersioningApi = new ApkVersioningApi();

export default api;
