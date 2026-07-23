import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chatbot from "@/components/chatbot/Chatbot";
import { sendChatbotMessage } from "@/services/chatbotService";

jest.mock("@/services/chatbotService", () => ({ sendChatbotMessage: jest.fn() }));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

test("opens, sends a suggested question, and keeps the reply in history", async () => {
  jest.mocked(sendChatbotMessage).mockResolvedValue("Choose a restaurant and select Book a Table.");
  const user = userEvent.setup();
  render(<Chatbot />);

  await user.click(screen.getByRole("button", { name: "Open MealNest AI" }));
  expect(screen.getByRole("heading", { name: "MealNest AI" })).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Book a table" }));
  expect(sendChatbotMessage).toHaveBeenCalledWith("Book a table");
  await waitFor(() => expect(screen.getByText("Choose a restaurant and select Book a Table.")).toBeVisible());
  expect(screen.getAllByText("Book a table")).toHaveLength(2);
});
