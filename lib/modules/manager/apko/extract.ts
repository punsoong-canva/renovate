import { logger } from '../../../logger';
import { getSiblingFileName, readLocalFile } from '../../../util/fs';
import { parseSingleYaml } from '../../../util/yaml';
import { ApkDatasource } from '../../datasource/apk';
import { id as looseVersioning } from '../../versioning/loose';
import type { PackageDependency, PackageFileContent } from '../types';

// Simple schema for apko configuration
interface ApkoConfig {
  contents?: {
    repositories?: string[];
    packages?: string[];
  };
  environment?: Record<string, string>;
  cmd?: string;
  archs?: string[];
}

// Schema for apko lock file
interface ApkoLockFile {
  schema_version: number;
  archs: Record<
    string,
    {
      packages: {
        name: string;
        version: string;
        origin: string;
        arch: string;
        size: number;
        checksum: string;
      }[];
    }
  >;
}

export async function extractPackageFile(
  content: string,
  packageFile: string,
): Promise<PackageFileContent | null> {
  logger.trace('apko.extractPackageFile()');

  try {
    const parsed = parseSingleYaml<ApkoConfig>(content);
    const deps: PackageDependency[] = [];

    // Extract packages from the contents.packages array
    if (parsed.contents?.packages) {
      for (const pkg of parsed.contents.packages) {
        // Skip base packages that don't have versions
        if (pkg === 'alpine-base' || pkg === 'base') {
          continue;
        }

        // Try to extract version from package name (e.g., "git=2.39.0-r0" or "nginx-1.24.0")
        const equalsVersionMatch = /^(.+)=(\d+\.\d+\.\d+.*)$/.exec(pkg);
        const hyphenVersionMatch = /^(.+)-(\d+\.\d+\.\d+.*)$/.exec(pkg);

        if (equalsVersionMatch) {
          const [, depName, currentValue] = equalsVersionMatch;
          deps.push({
            datasource: ApkDatasource.id,
            depName,
            currentValue,
            versioning: looseVersioning,
            registryUrls: parsed.contents?.repositories,
          });
        } else if (hyphenVersionMatch) {
          const [, depName, currentValue] = hyphenVersionMatch;
          deps.push({
            datasource: ApkDatasource.id,
            depName,
            currentValue,
            versioning: looseVersioning,
            registryUrls: parsed.contents?.repositories,
          });
        } else {
          // Package without version - add as unversioned
          deps.push({
            datasource: ApkDatasource.id,
            depName: pkg,
            skipReason: 'not-a-version',
            registryUrls: parsed.contents?.repositories,
          });
        }
      }
    }

    if (!deps.length) {
      return null;
    }

    // Try to extract locked versions from apko.lock.json
    const lockFileName = getSiblingFileName(packageFile, 'apko.lock.json');
    const lockFileContent = await readLocalFile(lockFileName, 'utf8');

    let lockFiles: string[] | undefined;

    if (lockFileContent) {
      try {
        const lockFile = parseSingleYaml<ApkoLockFile>(lockFileContent);

        // Create a mapping of package names to locked versions
        const lockedVersions = new Map<string, string>();

        // Process all architectures (usually just one, but apko supports multiple)
        for (const archData of Object.values(lockFile.archs || {})) {
          for (const pkg of archData.packages || []) {
            lockedVersions.set(pkg.name, pkg.version);
          }
        }

        // Add locked versions to dependencies
        for (const dep of deps) {
          if (dep.depName && lockedVersions.has(dep.depName)) {
            dep.lockedVersion = lockedVersions.get(dep.depName);
          }
        }

        logger.debug(
          { packageFile, lockFileName },
          'Found apko.lock.json with locked versions',
        );
        lockFiles = [lockFileName];
      } catch (err) {
        logger.debug({ err, lockFileName }, 'Error parsing apko.lock.json');
        // Don't include lockFiles if parsing failed
        lockFiles = undefined;
      }
    }

    return {
      deps,
      lockFiles,
    };
  } catch (err) {
    logger.debug({ err, packageFile }, 'Error parsing apko YAML configuration');
    return null;
  }
}
