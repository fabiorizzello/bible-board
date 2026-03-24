# Contract: WOL Link Resolver

## Purpose

Define the adapter contract that converts scripture references stored in `Fonte.scrittura` into stable `wol.jw.org` URLs.

## Input Contract

The resolver accepts a normalized scripture reference:

```ts
type ScriptureReference = {
  bookNumber: number;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  originalLabel: string; // e.g. "Genesi 12:1-3"
};
```

## Output Contract

```ts
type WolLink = {
  href: string;
  label: string;
  target: "wol";
  granularity: "chapter";
};
```

## Resolution Rule

For v1, resolve to the Italian study-edition Bible navigator path:

```text
https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/{bookNumber}/{chapter}
```

### Example

Input:

```ts
{
  bookNumber: 1,
  chapter: 12,
  verseStart: 1,
  verseEnd: 3,
  originalLabel: "Genesi 12:1-3"
}
```

Output:

```ts
{
  href: "https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/1/12",
  label: "Genesi 12:1-3",
  target: "wol",
  granularity: "chapter"
}
```

## Behavioral Rules

- The app stores and displays the exact user reference label.
- The resolver must be deterministic and pure.
- Invalid references return a typed domain error; no malformed URL is emitted.
- The adapter does not depend on undocumented verse-fragment behavior in v1.

## Contract Tests

- `Genesi 12:1-3` resolves to `/it/wol/binav/r6/lp-i/nwtsty/1/12`.
- `Matteo 5:3` resolves to `/it/wol/binav/r6/lp-i/nwtsty/40/5`.
- Invalid book/chapter/verse combinations return a typed error.
