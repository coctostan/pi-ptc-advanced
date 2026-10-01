# Separate raw source metadata from terminal row padding

- Date: 2026-10-01
- Type: lesson
- Phase/Plan: 65 Regression Tests and Docs / 65-02
- Source: `.paul/phases/65-regression-tests-and-docs/65-02-SUMMARY.md` § Lesson retained for SKIP; `65-02-APPLY-LOG.md` §§ Task 1, SKIP knowledge candidate.
- Related: `test/code-execution-source-visibility.test.ts` § verifyDisclosure.

## Context
Real execution payloads passed exact raw-source checks, but initial rendered-row expectations assumed unpadded strings. Five new cases failed; existing tests passed.

## Content
Keep exact `code.split("\n")` equality at the execution boundary. Terminal assertions separately account for Text row padding and trailing-CR display normalization. Correct the mistaken display expectation, not protected runtime code. The official retry passed 36/36 with raw-source equality unchanged.

## Impact
Future execution/render regressions should distinguish storage invariants from terminal presentation without introducing production test hooks or changing runtime source semantics.
