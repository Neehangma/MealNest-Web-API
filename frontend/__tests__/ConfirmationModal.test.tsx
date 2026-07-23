import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "@/app/admin/_components/ConfirmationModal";

test("confirms or cancels adding a restaurant without dismissing itself", async () => {
  const user = userEvent.setup();
  const onNo = jest.fn();
  const onYes = jest.fn();

  render(
    <ConfirmationModal
      open
      title="Add Restaurant"
      message="Do you want to add this restaurant?"
      confirming={false}
      onNo={onNo}
      onYes={onYes}
    />,
  );

  expect(screen.getByRole("dialog", { name: "Add Restaurant" })).toHaveTextContent("Do you want to add this restaurant?");
  await user.click(screen.getByRole("button", { name: "No" }));
  expect(onNo).toHaveBeenCalledTimes(1);
  expect(onYes).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Yes" }));
  expect(onYes).toHaveBeenCalledTimes(1);
});
