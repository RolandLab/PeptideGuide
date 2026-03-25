# SwiftUI macOS Prompt Pack

Copy and adapt these prompts when working on native SwiftUI macOS apps like `PeptideGuideApp`.

## SwiftUI screen work

Use `frontend-skill` to improve this SwiftUI macOS screen for clarity, hierarchy, spacing, and scanability while preserving the existing product structure.

Use `frontend-skill` to refactor this SwiftUI view into smaller, easier-to-follow subviews without over-abstracting the code.

Use `frontend-skill` to tighten the layout and interaction design of this `NavigationSplitView` so it feels more native on macOS and works well across wide and narrow window sizes.

Use `frontend-skill` to improve the empty, loading, and selection states for this SwiftUI screen so the app feels intentional even when the user has not chosen anything yet.

## macOS-native behavior

Review this SwiftUI macOS implementation and make it feel more native. Focus on window sizing, sidebar behavior, toolbars, keyboard shortcuts, settings flow, and desktop interaction expectations.

Refine this macOS SwiftUI feature so it behaves well with resizing, multiple panes, focus changes, and keyboard-first navigation.

Improve this settings or preferences experience for a macOS app. Keep it compact, readable, and consistent with desktop conventions.

Help me add macOS-friendly polish to this screen, including better hover states, selection cues, contextual actions, and discoverability.

## App structure and state

Review this SwiftUI app architecture and simplify the state flow. Focus on making the data movement between `App`, shared store objects, and feature views easier to reason about.

Refactor this view or feature to reduce state duplication, make bindings clearer, and keep side effects in the right place.

Help me structure this SwiftUI macOS feature so the main view stays declarative while business logic lives in the right supporting types.

Review this `ObservableObject` or app store logic for unnecessary coupling, accidental re-renders, or confusing update paths, then implement the cleanup.

## Navigation and multi-pane flows

Improve this sidebar-content-detail flow so navigation state is more predictable and the selected item behavior feels solid across app launches and pane changes.

Help me model selection and detail presentation cleanly in this `NavigationSplitView`-based macOS app.

Refine this detail pane experience so it handles no-selection, switching items, and deeper drill-in states without feeling jumpy or fragile.

## Performance and quality

Review this SwiftUI screen for expensive recomputation, oversized view bodies, and avoidable state churn, then make practical performance improvements.

Help me make this SwiftUI macOS feature more testable. Favor straightforward architecture and small targeted tests over broad rewrites.

Add or improve Swift package tests for this feature and cover the key state transitions or business rules.

Review this code for accessibility issues in a macOS context, including readable structure, labels, contrast, and keyboard navigation support.

## AppKit interop and desktop edges

Help me decide whether this feature should stay pure SwiftUI or use a small amount of AppKit interop. Recommend the simplest approach and implement it if needed.

Improve this file import, export, panel, menu, or command flow for macOS. Keep the implementation lightweight and user-friendly.

Add keyboard shortcuts, menu commands, or focused actions to this macOS app in a way that fits the current architecture.

## Packaging and docs

Use `doc` to document how to build, run, test, and package this SwiftUI macOS app from the terminal.

Use `doc` to write a contributor note for this macOS app that explains the app structure, major screens, shared store, and packaging scripts.

Review the packaging scripts and app bundle flow for this project, then improve the developer ergonomics without changing the shipped behavior unnecessarily.

## Integrations and security

Use `chatgpt-apps` to design a clean integration approach for adding assistant-driven or tool-driven behavior to this macOS app. Start with architecture, then implement the smallest useful slice.

Use `security-best-practices` to review this local app integration for safe handling of API keys, tokens, local storage, and outbound requests.

Use `security-threat-model` to identify the main risks for this macOS feature, especially around secrets, imported files, external APIs, and user-generated content.

## Good combos

Use `frontend-skill` to improve this SwiftUI screen, then add focused tests for the state logic that supports it.

Use `frontend-skill` to make this multi-pane macOS experience feel more native, then use `doc` to capture any changed behavior or developer workflow.

Use `chatgpt-apps` to shape the integration design, then use `security-best-practices` to harden it before we expand the feature.

## Project-specific starters

Use `frontend-skill` to improve `AppShellView` so the `NavigationSplitView` feels more refined and native on macOS while preserving the current app structure.

Use `frontend-skill` to improve the readability and density of `CompoundDetailView` for desktop use without making the screen feel cramped.

Help me simplify `AppStore` state flow so selection, detail presentation, and launch preferences are easier to maintain and test.

Use `doc` to document the purpose of `tools/package_app.sh`, `tools/package_dmg.sh`, and the expected release workflow for `PeptideGuideApp`.

## Notes

`playwright` is usually more useful for web apps than native SwiftUI macOS apps. For this repository, prefer it only if we add a web surface, embedded web content, or browser-based verification around related tooling.
