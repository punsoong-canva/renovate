import { logger } from '../../../logger';
import { exec } from '../../../util/exec';
import type { ExecOptions } from '../../../util/exec/types';
import { getSiblingFileName, readLocalFile } from '../../../util/fs';
import type { UpdateArtifact, UpdateArtifactsResult } from '../types';

export async function updateArtifacts({
  config: { isLockFileMaintenance },
  packageFileName,
}: UpdateArtifact): Promise<UpdateArtifactsResult[] | null> {
  const lockFileName = getSiblingFileName(packageFileName, 'apko.lock.json');
  const existingLockFileContent = await readLocalFile(lockFileName, 'utf8');
  logger.error('reeeeee');
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

  logger.error('testee');

  const cmd = [];
  if (isLockFileMaintenance) {
    cmd.push('apko lock update');
  } else {
    logger.trace('No updated apko packages - returning null');
    return null;
  }

  const oldLockFileContent = await readLocalFile(lockFileName);
  if (!oldLockFileContent) {
    logger.trace(`No ${lockFileName} found`);
    return null;
  }

  try {
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
