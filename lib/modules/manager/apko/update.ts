import { logger } from '../../../logger';
import type { UpdateDependencyConfig } from '../types';

export function updateDependency({
  fileContent,
  upgrade,
}: UpdateDependencyConfig): string | null {
  const { depName, currentValue, newValue } = upgrade;

  if (!depName || !currentValue || !newValue) {
    logger.debug('Missing required fields for APK update');
    return null;
  }

  // Only look at APK packages in apko.yaml that use exact versions only (=version)
  // Range constraints are not supported and will be skipped during extraction

  // Find the package line with exact version
  const packageLineRegex = new RegExp(
    `^\\s*-\\s+${depName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=.*$`,
    'm',
  );

  const match = fileContent.match(packageLineRegex);
  if (!match) {
    // Check if the new version is already present (for reuseExistingBranch case)
    const newPackageSpec = `${depName}=${newValue}`;
    if (fileContent.includes(newPackageSpec)) {
      logger.trace('Version is already updated');
      return fileContent;
    }

    // Fallback to old behavior for backward compatibility with tests
    const oldPackageSpec = `${depName}=${currentValue}`;
    if (fileContent.includes(oldPackageSpec)) {
      const newContent = fileContent.replace(oldPackageSpec, newPackageSpec);

      if (newContent === fileContent) {
        logger.trace('Version is already updated');
        return fileContent;
      }

      logger.debug(
        { depName, currentValue, newValue },
        'Successfully updated APK package version',
      );
      return newContent;
    }

    logger.debug(
      { depName, currentValue, oldPackageSpec: `${depName}=${currentValue}` },
      'Could not find package specification to replace',
    );
    return null;
  }

  const oldPackageLine = match[0];

  // Check if the version is already updated (for reuseExistingBranch case)
  if (oldPackageLine.includes(`${depName}=${newValue}`)) {
    logger.trace('Version is already updated');
    return fileContent;
  }

  // Extract the prefix (indentation and list marker)
  const constraintMatch = /^(\s*-\s+)([^=]+)(=.*)$/.exec(oldPackageLine);
  /* v8 ignore next 4 - defensive check, packageLineRegex ensures this will match */
  if (!constraintMatch) {
    logger.debug('Could not parse package line');
    return null;
  }

  const [, prefix] = constraintMatch;

  // Build the new package line with exact version
  // Add = operator since apko.yaml requires =version format
  const newPackageLine = `${prefix}${depName}=${newValue}`;

  // Replace the old package line with the new one
  const newContent = fileContent.replace(oldPackageLine, newPackageLine);

  if (newContent === fileContent) {
    logger.trace('Version is already updated');
    return fileContent;
  }

  logger.debug(
    { depName, currentValue, newValue },
    'Successfully updated APK package version',
  );

  return newContent;
}
