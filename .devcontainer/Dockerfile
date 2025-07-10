FROM ghcr.io/containerbase/devcontainer:13.8.54

# https://github.com/pnpm/pnpm/issues/8971
# renovate: datasource=npm
RUN install-tool pnpm 10.12.4
RUN install-tool node 22.17.0
WORKDIR /tmp
RUN curl -LO https://github.com/chainguard-dev/apko/releases/download/v0.29.2/apko_0.29.2_linux_amd64.tar.gz
RUN tar -xvf apko_0.29.2_linux_amd64.tar.gz
RUN mv apko_0.29.2_linux_amd64/apko /usr/local/bin/apko

