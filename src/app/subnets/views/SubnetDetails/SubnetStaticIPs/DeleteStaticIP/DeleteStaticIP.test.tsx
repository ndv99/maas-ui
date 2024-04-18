import DeleteStaticIPs from "./DeleteStaticIP";

import { renderWithBrowserRouter, screen } from "@/testing/utils";

it("renders a delete confirmation form", () => {
  renderWithBrowserRouter(<DeleteStaticIPs setSidePanelContent={vi.fn()} />);
  expect(
    screen.getByRole("form", { name: "Delete static IP" })
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      "Are you sure you want to delete this static IP? This action is permanent and can not be undone."
    )
  ).toBeInTheDocument();
});
