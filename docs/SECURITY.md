# Security Policy

## Supported versions

While UniSwitch is pre-1.0, only the latest release and the `main` branch receive security fixes. Once there's a 1.0, this section will list which major versions are supported.

| Version         | Supported |
| --------------- | --------- |
| `main` (latest) | yes       |
| older releases  | no        |

## Reporting a vulnerability

Please **do not** open a public issue for a security vulnerability. Instead, use GitHub's private vulnerability reporting: go to the repository's **Security** tab → **Report a vulnerability**. This opens a private advisory visible only to maintainers until it's resolved.

Include, as far as you can:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof of concept
- The affected version or commit

You should get an acknowledgment within a few days. This is a community-driven project without a dedicated security team, so response and fix timelines depend on maintainer availability rather than a fixed SLA, but security reports are prioritized over regular bug fixes.

## Scope

In scope:

- The conversion pipeline (`packages/core`, `packages/languages/*`) — particularly anything that could turn malicious input source code into unexpected behavior on the machine running the conversion.
- The web app and API (`apps/web`) — particularly anything affecting the hosted instance or a self-hosted deployment.
- The webhook listener (`apps/webhook`) — particularly signature verification and anything that could let an unauthorized request trigger a deploy.

Out of scope:

- Vulnerabilities that require an already-compromised server or physical access.
- Missing security headers or best-practice suggestions with no demonstrated exploit, these are welcome as a regular issue rather than a security report.
- Social engineering.

## A note on what UniSwitch does with source code

UniSwitch parses source code, it does not execute it. Converting a file does not run the code in that file, in the CLI, the web app, or the hosted instance. If you find a code path where conversion does result in execution of submitted input, that's a vulnerability and should be reported through the process above, not filed as a feature gap.

## Disclosure

Once a fix is available, an advisory is published crediting the reporter (unless anonymity is requested) with a description of the issue and affected versions. Coordinated disclosure is preferred, please allow time for a fix before discussing a vulnerability publicly.
