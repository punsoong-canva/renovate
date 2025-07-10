import { logger } from '../../../logger';
import { exec } from '../../../util/exec';
import type { ExecOptions } from '../../../util/exec/types';
import {
  getSiblingFileName,
  readLocalFile,
  writeLocalFile,
} from '../../../util/fs';
import type { UpdateArtifact, UpdateArtifactsResult } from '../types';

export async function updateArtifacts({
  config: { isLockFileMaintenance },
  packageFileName,
  updatedDeps,
  newPackageFileContent,
}: UpdateArtifact): Promise<UpdateArtifactsResult[] | null> {
  const lockFileName = getSiblingFileName(packageFileName, 'apko.lock.json');
  const existingLockFileContent = await readLocalFile(lockFileName, 'utf8');

  if (!existingLockFileContent) {
    logger.debug('No apko.lock.json found');
    return null;
  }

  const execOptions: ExecOptions = {
    cwdFile: packageFileName,
    toolConstraints: [
      {
        toolName: 'apko',
      },
    ],
    docker: {},
  };

  const oldLockFileContent = await readLocalFile(lockFileName);
  if (!oldLockFileContent) {
    logger.trace(`No ${lockFileName} found`);
    return null;
  }

  try {
    // Write the updated package file content first
    await writeLocalFile(packageFileName, newPackageFileContent);

    let cmd: string;
    if (isLockFileMaintenance || updatedDeps.length > 0) {
      // For both lock file maintenance and regular updates, regenerate the entire lock file
      // since apko lock doesn't support updating specific packages
      logger.debug(
        { isLockFileMaintenance, updatedDepsCount: updatedDeps.length },
        'Regenerating apko.lock.json',
      );
      cmd = 'apko lock apko.yaml';
    } else {
      logger.trace('No updated apko packages - returning null');
      return null;
    }

    await exec(cmd, execOptions);
    const newLockFileContent = await readLocalFile(lockFileName);

    if (
      !newLockFileContent ||
      Buffer.compare(oldLockFileContent, newLockFileContent) === 0
    ) {
      return null;
    }
    logger.trace('Returning updated apko.lock.json');
    return [
      {
        file: {
          type: 'addition',
          path: lockFileName,
          contents: newLockFileContent,
        },
      },
    ];
  } catch (err) {
    logger.warn({ err }, 'Error updating apko.lock.json');
    return [
      {
        artifactError: {
          lockFile: lockFileName,
          stderr: err.message,
        },
      },
    ];
  }
}
