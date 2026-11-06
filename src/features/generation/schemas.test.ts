import { describe, expect, it } from "vitest";
import { proGenerationSchema } from "./schemas";

const validProValues = {
  prompt: "云海中的灯塔",
  negativePrompt: "",
  width: 768,
  height: 432,
  cfgScale: 7.5,
  steps: 25,
  sampler: "Euler a",
  seed: -1,
};

describe("pro generation schema", () => {
  it("accepts backend-compatible parameters", () => {
    expect(proGenerationSchema.safeParse(validProValues).success).toBe(true);
  });

  it("rejects zero seed because the backend treats zero as an empty value", () => {
    expect(
      proGenerationSchema.safeParse({ ...validProValues, seed: 0 }).success,
    ).toBe(false);
  });

  it.each([
    { width: 63 },
    { width: 2049 },
    { cfgScale: 0 },
    { cfgScale: 31 },
    { steps: 0 },
    { steps: 151 },
  ])("rejects an out-of-range value: %o", (patch) => {
    expect(
      proGenerationSchema.safeParse({ ...validProValues, ...patch }).success,
    ).toBe(false);
  });
});
