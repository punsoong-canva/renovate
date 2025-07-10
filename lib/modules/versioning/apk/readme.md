Alpine Package Keeper (apk) versioning is used for packages served from [APK repositories](https://wiki.alpinelinux.org/wiki/Repositories) such as the official Alpine Linux repositories or the Wolfi APK package repository (https://packages.wolfi.dev/os)

Versions are similar to other Linux distributions, e.g. 3.2.1-r0

- The first segment follow semantic versioning
- Alpha, release candidates (_rc2), etc are prefixed with underscore _ not a hyphen.
- Subsequent package versions are -r0, -r1, and so on; the number is from $pkgver.
- Subsequent package fixes are \_p0, \_p1 (typically seen if not using major.minor.patch, e.g. 6.5_p20250503-r0)

Ranges are not supported by this versioning.
