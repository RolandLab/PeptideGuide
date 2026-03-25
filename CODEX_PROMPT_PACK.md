# Codex Prompt Pack

Copy and adapt these prompts when you want Codex to use the installed skills intentionally.

## Build and improve features

Use `frontend-skill` to improve the UX and visual hierarchy of this SwiftUI screen without breaking the current information architecture. Keep the existing app style coherent and make the result feel more polished and easier to scan.

Use `frontend-skill` to refactor this part of the app into clearer SwiftUI components. Favor readability, maintainability, and small reusable views over clever abstractions.

Use `frontend-skill` to review this screen for rough edges in spacing, typography, alignment, empty states, and interaction flow, then implement the improvements.

## Browser and flow verification

Use `playwright` to verify the main user flow for this feature, reproduce any visible issues, and tell me exactly where the behavior diverges from expectations.

Use `playwright` to inspect the rendered UI for this screen, identify layout or interaction bugs, and fix the issues you can reproduce locally.

Use `playwright` to create or update an end-to-end test for this flow and make sure it covers the happy path plus one meaningful failure case.

## Integrations and ChatGPT-connected work

Use `chatgpt-apps` to design the integration points for this feature, including tool boundaries, data flow, error handling, and the minimum implementation plan.

Use `chatgpt-apps` to help me add a ChatGPT-style app integration for this project. Start by proposing the architecture, then implement the first vertical slice.

Use `chatgpt-apps` to review this integration approach and simplify it. I want the fewest moving parts that still give us a solid developer experience.

## Security and external APIs

Use `security-best-practices` to review this auth or API integration before we ship it. Focus on secrets handling, trust boundaries, validation, and obvious misuse risks.

Use `security-best-practices` to harden this webhook or callback handler. Keep the implementation practical and explain any tradeoffs briefly.

Use `security-threat-model` to identify the main abuse cases and security risks for this feature before we build more on top of it.

## Production and debugging

Use `sentry` to investigate this error, identify the likely failing code path, and suggest the smallest safe fix.

Use `sentry` to triage these recurring issues and group them by likely root cause so we can prioritize the highest-value fix first.

Use `gh-fix-ci` to diagnose why this GitHub Actions workflow is failing and make the smallest change that gets CI green again.

Use `gh-address-comments` to turn these PR comments into concrete code changes while preserving the intent of the original implementation.

## Specs, tickets, and docs

Use `linear` to map this task into an implementation plan, then start with the first code change that de-risks the work.

Use `notion-spec-to-implementation` to turn this product spec into an engineering plan and then implement the first meaningful slice.

Use `doc` to update the project documentation so setup, feature behavior, and any changed workflows are clearly captured for future work.

## Good default combos

Use `frontend-skill` first, then `playwright`, to improve this screen and verify the result end to end.

Use `chatgpt-apps` first, then `security-best-practices`, to build this integration safely.

Use `notion-spec-to-implementation`, then `frontend-skill`, then `playwright`, to turn this idea into a working and validated feature.

Use `sentry` to find the likely root cause, then use `frontend-skill` or `chatgpt-apps` as needed to implement the fix cleanly.

## Project-specific starters

Use `frontend-skill` to improve the usability of the compare flow in `PeptideGuideApp` without changing the underlying data model.

Use `frontend-skill` to tighten the information density and readability of the compound detail experience in `PeptideGuideApp`.

Use `playwright` to validate the main browse, detail, saved, and compare flows for `PeptideGuideApp` and report the roughest UX issues.

Use `doc` to write a concise contributor guide for `PeptideGuideApp`, including how to run, test, and package the app from this repository.
