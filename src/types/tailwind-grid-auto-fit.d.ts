// This Tailwind plugin ships no type declarations. We import it (not require it)
// to satisfy @typescript-eslint/no-require-imports, so TS needs this ambient
// module decl to avoid TS7016 (implicitly 'any'). It's a Tailwind plugin object.
declare module "@shrutibalasa/tailwind-grid-auto-fit";
