import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckForm } from "./CheckForm";

describe("SafeSign check form", () => {
  it("shows a friendly error and does not start a check for an empty input", () => {
    render(<CheckForm language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Check it" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please paste a link, address, or transaction first.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});