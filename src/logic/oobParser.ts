
```ts
export type OobParameters = {
  [key: string]: string | number | number[];
};

export function parseOob(content: string): OobParameters {
  const lines = content.split('\n').filter(Boolean);
  const params: OobParameters = {};

  for (let line of lines) {
    line = line.trim();

    // Skip anything not a parameter line
    if (!line.startsWith('@@')) continue;

    const [rawKey, ...values] = line.split(';');
    const key = rawKey.replace('@@', '').trim();

    const parsedValues = values
      .join(';') // recombine in case of split values
      .split(/[;#\s]/) // support both ; and # as delimiters
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .map(v => Number(v));

    // If only one value, store as number, else as array
    params[key] = parsedValues.length === 1 ? parsedValues[0] : parsedValues;
  }

  return params;
}
