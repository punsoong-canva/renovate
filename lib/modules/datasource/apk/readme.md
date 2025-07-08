# APK Datasource

The APK datasource is designed to work with Alpine Linux package repositories. It can fetch package information from APK repositories and provide version updates for Alpine Linux packages.

## Overview

Alpine Linux uses the APK package manager, and packages are distributed through repositories. Each repository contains an `APKINDEX.tar.gz` file that contains metadata about all available packages.

## Repository Structure

Alpine Linux repositories typically follow this structure:

```
https://dl-cdn.alpinelinux.org/alpine/v3.19/main/x86_64/APKINDEX.tar.gz
https://dl-cdn.alpinelinux.org/alpine/v3.19/community/x86_64/APKINDEX.tar.gz
```

## Supported Repository URLs

The datasource supports:

- Official Alpine Linux repositories (e.g., `https://dl-cdn.alpinelinux.org/alpine/v3.19/main`)
- Community repositories (e.g., `https://dl-cdn.alpinelinux.org/alpine/v3.19/community`)
- Custom APK repositories (e.g., `https://packages.wolfi.dev/os`)

## Package Format

APK packages are identified by:

- **Name**: The package name (e.g., `nginx`)
- **Version**: The package version (e.g., `1.24.0-r0`)
- **Architecture**: The target architecture (e.g., `x86_64`)

## Usage in APKO

When used with the APKO manager, the datasource can:

1. Extract package names from `apko.yaml` files
2. Look up available versions from APK repositories
3. Provide version updates for Alpine Linux packages

## Example Configuration

```yaml
# apko.yaml
contents:
  repositories:
    - https://dl-cdn.alpinelinux.org/alpine/v3.19/main
    - https://dl-cdn.alpinelinux.org/alpine/v3.19/community
  packages:
    - nginx
    - openssl
```

## Implementation Details

The datasource:

1. Fetches the `APKINDEX.tar.gz` file from the repository
2. Parses the package metadata
3. Extracts version information
4. Returns available versions for requested packages

## Caching

Package information is cached for 1 hour to reduce API calls to repositories.

## Error Handling

The datasource handles:

- 404 errors (package not found)
- Network timeouts
- Invalid repository URLs
- Malformed package metadata
