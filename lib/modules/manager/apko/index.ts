import { ApkDatasource } from '../../datasource/apk';

export { extractPackageFile } from './extract';
export { updateArtifacts } from './artifacts';

export const supportsLockFileMaintenance = true;

export const defaultConfig = {
  managerFilePatterns: ['/(^|/)apko\\.ya?ml$/'],
  lockFiles: ['apko.lock.json'],
};

export const supportedDatasources = [ApkDatasource.id];
