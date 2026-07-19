import { render, screen } from "@testing-library/react";
import Navbar from "@/app/_components/Navbar";

test("preserves the current public navigation links", () => {
  render(<Navbar />);
  expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
});
