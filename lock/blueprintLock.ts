export interface TransformHashInput {
  w: number;
  h: number;
  pixelSpace: "1:1";
  noNormalize: boolean;
}

export function makeTransformHash(input: TransformHashInput): string {
  const stable = JSON.stringify(input);
  return stable;
}
