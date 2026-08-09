import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SearchInput } from "./search-input";

function SearchInputHarness() {
  const [value, setValue] = useState("");

  return <SearchInput onValueChange={setValue} value={value} />;
}

describe("SearchInput", () => {
  it("accepts text and can clear it", async () => {
    const user = userEvent.setup();
    render(<SearchInputHarness />);

    const input = screen.getByRole("searchbox", { name: "Search" });
    await user.type(input, "mathematics");

    expect(input).toHaveValue("mathematics");

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
  });
});
