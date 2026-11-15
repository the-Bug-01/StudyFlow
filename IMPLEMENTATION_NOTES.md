# Implementation notes

## Main request flow
1. React validates that the notes field is not empty and creates a monotonically increasing request ID.
2. The browser posts notes, selected output mode, and item count to `/api/generate`.
3. Express validates the request with Zod and checks server-side API configuration.
4. Express calls Gemini with JSON response mode and a constrained prompt.
5. The response text is parsed, then validated against strict Zod schemas and semantic invariants (requested sections exist, counts are within bounds, IDs are unique).
6. Only validated structured data is sent to React.
7. React renders flashcards and quiz controls; it never renders raw model text as a chat response.

## Why validation is on the server
The browser should not be trusted to enforce the data contract, and the provider response should not be sent to the UI without validation. Server validation also keeps provider-specific response handling out of React components.

## Important follow-up improvements
- Add unit tests for `extractJson` and `validateStudySet`, including malformed JSON, missing keys, wrong option count, invalid answer index, duplicate IDs, and empty output.
- Add integration tests for timeout, provider 429/5xx, missing API key, and malformed provider responses.
- Consider retrying one time for schema-invalid model output, with a strict retry budget.
- Add abort-on-unmount and an explicit cancel action.
- Add persistent study sessions if time allows.
