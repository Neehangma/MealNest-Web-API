import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chatbot from "@/components/chatbot/Chatbot";
import { sendChatbotMessage } from "@/services/chatbotService";

jest.mock("@/services/chatbotService", () => ({ sendChatbotMessage: jest.fn() }));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

test("opens without the booking action and sends another suggested question", async () => {
  jest.mocked(sendChatbotMessage).mockResolvedValue("You can pay by card or cash.");
  const user = userEvent.setup();
  render(<Chatbot />);

  await user.click(screen.getByRole("button", { name: "Open MealNest AI" }));
  expect(screen.getByRole("heading", { name: "MealNest AI" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Book a table" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Payment methods" }));
  expect(sendChatbotMessage).toHaveBeenCalledWith("Payment methods");
  await waitFor(() => expect(screen.getByText("You can pay by card or cash.")).toBeVisible());
});
