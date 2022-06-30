// import { mount } from "enzyme";
import { within, screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import BridgeFormFields from "./BridgeFormFields";

import { rootState as rootStateFactory } from "testing/factories";
import { waitForComponentToPaint } from "testing/utils";

const mockStore = configureStore();

describe("BridgeFormFields", () => {
  it("does not display the fd field if stp isn't on", async () => {
    const store = mockStore(rootStateFactory());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <Formik initialValues={{}} onSubmit={jest.fn()}>
            <BridgeFormFields />
          </Formik>
        </MemoryRouter>
      </Provider>
    );
    expect(
      screen.queryByLabelText("Forward delay (ms)")
    ).not.toBeInTheDocument();
  });

  it("displays the fd field if stp is on", async () => {
    const store = mockStore(rootStateFactory());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <Formik initialValues={{}} onSubmit={jest.fn()}>
            <BridgeFormFields />
          </Formik>
        </MemoryRouter>
      </Provider>
    );

    // const stp_button = screen.getByRole("checkbox", {
    //   name: "[object Object]",
    // });

    const stp_button = screen.getByRole("checkbox");

    await userEvent.click(stp_button);

    await waitFor(() =>
      expect(screen.getByLabelText("Forward delay (ms)")).toBeInTheDocument()
    );
  });
});
