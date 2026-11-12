import { afterEach, describe, expect, it, vi } from "vitest";
import { checkInput } from "./api.js";

describe("SafeSign mocked screening API", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits two seconds and blocks input containing airdrop", async () => {
    vi.useFakeTimers();
    const pending = checkInput("link", "https://example.test/airdrop");
    await vi.advanceTimersByTimeAsync(1999);
    let settled = false;
    void pending.then(() => { settled = true; });
    await Promise.resolve();
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toMatchObject({ verdict: "block", score: 94 });
  });

  it("marks input containing new as risky", async () => {
    vi.useFakeTimers();
    const pending = checkInput("link", "new offer");
    await vi.advanceTimersByTimeAsync(2000);
    await expect(pending).resolves.toMatchObject({ verdict: "risky", score: 62 });
  });

  it("marks other input safe and returns Pidgin reasons when requested", async () => {
    vi.useFakeTimers();
    const pending = checkInput("address", "0x123", "pidgin");
    await vi.advanceTimersByTimeAsync(2000);
    await expect(pending).resolves.toMatchObject({
      verdict: "safe",
      score: 8,
      language: "pidgin",
      reasons: ["We no see common warning words.", "Na basic check be this, e no be guarantee."],
    });
  });
});