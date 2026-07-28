/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chatbot from "@/components/chatbot/Chatbot";
import { sendChatbotMessage } from "@/services/chatbotService";

jest.mock("@/services/chatbotService", () => ({ sendChatbotMessage: jest.fn() }));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

test("opens without suggested actions and sends a typed message", async () => {
  jest.mocked(sendChatbotMessage).mockResolvedValue("You can pay by card or cash.");
  const user = userEvent.setup();
  render(<Chatbot />);

  await user.click(screen.getByRole("button", { name: "Open MealNest AI" }));
  expect(screen.getByRole("heading", { name: "MealNest AI" })).toBeVisible();
  expect(screen.queryByLabelText("Suggested questions")).not.toBeInTheDocument();

  await user.type(screen.getByRole("textbox", { name: "Message MealNest AI" }), "Payment methods");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(sendChatbotMessage).toHaveBeenCalledWith("Payment methods");
  await waitFor(() => expect(screen.getByText("You can pay by card or cash.")).toBeVisible());
});
