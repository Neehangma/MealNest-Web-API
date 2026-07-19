import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmationModal from "@/app/admin/_components/DeleteConfirmationModal";

const props = { open: true, title: "Delete Restaurant", name: "E2E Bistro", message: "This cannot be undone.", confirmLabel: "Delete Restaurant", deleting: false, onCancel: jest.fn(), onConfirm: jest.fn() };
beforeEach(() => { props.onCancel.mockClear(); props.onConfirm.mockClear(); });

test("stays absent while closed", () => {
  render(<DeleteConfirmationModal {...props} open={false} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("renders details and invokes cancel and confirmation callbacks", async () => {
  const { rerender } = render(<DeleteConfirmationModal {...props} />);
  const dialog = screen.getByRole("dialog", { name: "Delete Restaurant" });
  expect(dialog).toHaveTextContent("E2E Bistro");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole("button", { name: "Delete Restaurant" }));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  rerender(<DeleteConfirmationModal {...props} deleting />);
  expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
});

test("supports Escape cancellation only when not deleting", () => {
  const { rerender } = render(<DeleteConfirmationModal {...props} />);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  rerender(<DeleteConfirmationModal {...props} deleting />);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(props.onCancel).toHaveBeenCalledTimes(1);
});
