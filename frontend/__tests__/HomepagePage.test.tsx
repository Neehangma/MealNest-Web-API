import { render, screen } from "@testing-library/react";
import HomepagePage from "@/app/(homepage)/page";

test("renders the current homepage route content", () => {
  render(<HomepagePage />);
  expect(screen.getByText("Homepage")).toBeVisible();
});
