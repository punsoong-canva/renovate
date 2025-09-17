The `apko` manager can update [apko's](https://github.com/chainguard-dev/apko) packages listed in `apko.yaml` files with versions specified, e.g.

```yaml
contents:
  repositories:
    - https://packages.wolfi.dev/os
  keyring:
    - https://packages.wolfi.dev/os/wolfi-signing.rsa.pub
  packages:
    - glibc=2.36-r3
    - binutils=2.39-r4
    - git=2.39.0-r0
    - openssl=3.0.7-r0
    - sysstat=12.6.2-r0
    - libcrypto3=3.0.8-r0

archs:
  - x86_64
  - aarch64
```

Note: `apko` does not specify a default filenames, however [rules_apko](https://github.com/chainguard-dev/rules_apko) examples use `apko.yaml` as the filename and hence use `apko.lock.json` lock filenames.

This manager also support lock file `LockFileMaintenance`, updating `apko.lock.json` files that are generated with the `apko lock apko.yaml` command.
