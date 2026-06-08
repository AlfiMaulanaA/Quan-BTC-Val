import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

test("renders main layout correctly", () => {
  const { container } = render(<App />);
  expect(container).toBeDefined();
});
