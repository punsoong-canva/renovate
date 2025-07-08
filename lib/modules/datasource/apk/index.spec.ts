import { getPkgReleases } from '..';
import type { GetPkgReleasesConfig } from '../types';
import { ApkDatasource } from '.';
import * as httpMock from '~test/http-mock';

describe('modules/datasource/apk/index', () => {
  const apkDatasource = new ApkDatasource();

  it('should export ApkDatasource', () => {
    expect(ApkDatasource).toBeDefined();
  });

  it('should have correct id', () => {
    expect(ApkDatasource.id).toBe('apk');
  });

  it('should have default registry URLs', () => {
    expect(apkDatasource.defaultRegistryUrls).toEqual([
      'https://dl-cdn.alpinelinux.org/alpine/v3.19/main',
      'https://dl-cdn.alpinelinux.org/alpine/v3.19/community',
    ]);
  });

  it('should support custom registries', () => {
    expect(apkDatasource.customRegistrySupport).toBe(true);
  });

  describe('getReleases', () => {
    it('should return null for unknown package', async () => {
      const config: GetPkgReleasesConfig = {
        datasource: 'apk',
        packageName: 'unknown-package',
        registryUrls: ['https://dl-cdn.alpinelinux.org/alpine/v3.19/main'],
      };

      httpMock
        .scope('https://dl-cdn.alpinelinux.org')
        .get('/alpine/v3.19/main/x86_64/APKINDEX.tar.gz')
        .reply(404)
        .get('/alpine/v3.19/main/APKINDEX.tar.gz')
        .reply(404);

      const res = await getPkgReleases(config);
      expect(res).toBeNull();
    });

    it('should handle missing registry URL', async () => {
      const config: GetPkgReleasesConfig = {
        datasource: 'apk',
        packageName: 'nginx',
      };

      const res = await getPkgReleases(config);
      expect(res).toBeNull();
    });
  });
});
