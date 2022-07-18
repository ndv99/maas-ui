// import { mount } from "enzyme";
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import AddInterface from "./AddInterface";

import { actions as deviceActions } from "app/store/device";
// import deviceSelectors from "app/store/device/selectors";
import { DeviceIpAssignment } from "app/store/device/types";
import type { RootState } from "app/store/root/types";
import {
  device as deviceFactory,
  deviceDetails as deviceDetailsFactory,
  // deviceEventError as deviceEventErrorFactory,
  deviceState as deviceStateFactory,
  deviceStatus as deviceStatusFactory,
  deviceStatuses as deviceStatusesFactory,
  rootState as rootStateFactory,
  subnet as subnetFactory,
  subnetState as subnetStateFactory,
} from "testing/factories";
// import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("AddInterface", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      device: deviceStateFactory({
        items: [
          deviceDetailsFactory({
            system_id: "abc123",
          }),
        ],
        loaded: true,
        statuses: deviceStatusesFactory({
          abc123: deviceStatusFactory(),
        }),
      }),
      subnet: subnetStateFactory({
        items: [
          subnetFactory({ id: 1, name: "subnet-1" }),
          subnetFactory({ id: 2, name: "subnet-2" }),
        ],
        loaded: true,
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("displays a spinner if device is not detailed version", () => {
    state.device.items[0] = deviceFactory({ system_id: "abc123" });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <AddInterface closeForm={jest.fn()} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("correctly dispatches action to create an interface", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <AddInterface closeForm={jest.fn()} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    await userEvent.clear(screen.getByRole("textbox", { name: "Name" }));

    await userEvent.type(
      screen.getByRole("textbox", { name: "Name" }),
      "eth123"
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "IP assignment" }),
      "static"
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Subnet" }),
      "172.16.1.0/24 (subnet-2)"
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: "MAC address" }),
      "11:22:33:44:55:66"
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: "IP address" }),
      "192.168.1.1"
    );

    await userEvent.click(screen.getByRole("textbox", { name: "Tags" }));

    await userEvent.keyboard("tag1{Enter}tag2{Enter}");

    await userEvent.click(
      screen.getByRole("button", { name: "Save interface" })
    );

    const formValues = {
      ip_address: "192.168.1.1",
      ip_assignment: DeviceIpAssignment.STATIC,
      mac_address: "11:22:33:44:55:66",
      name: "eth123",
      subnet: 2,
      tags: ["tag1", "tag2"],
    };

    const expectedAction = deviceActions.createInterface({
      ...formValues,
      system_id: "abc123",
    });

    await waitFor(() => {
      expect(
        store.getActions().find((action) => action.type === expectedAction.type)
      ).toStrictEqual(expectedAction);
    });
  });

  // it("closes the form if there are no errors when creating the interface", () => {
  //   const closeForm = jest.fn();
  //   state.device.errors = null;
  //   const store = mockStore(state);
  //   const Proxy = ({ systemId = "abc123" }) => (
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <CompatRouter>
  //           <AddInterface closeForm={closeForm} systemId={systemId} />
  //         </CompatRouter>
  //       </MemoryRouter>
  //     </Provider>
  //   );
  //   const wrapper = mount(<Proxy />);
  //   const formValues = {
  //     ip_address: "192.168.1.1",
  //     ip_assignment: DeviceIpAssignment.STATIC,
  //     mac_address: "11:22:33:44:55:66",
  //     name: "eth123",
  //     subnet: 2,
  //     tags: ["tag1", "tag2"],
  //   };
  //   submitFormikForm(wrapper, formValues);
  //   const creatingInterface = jest.spyOn(deviceSelectors, "getStatusForDevice");
  //   creatingInterface.mockReturnValue(true);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   creatingInterface.mockReturnValue(false);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   expect(closeForm).toHaveBeenCalled();
  // });

  // it("does not close the form if there is an error when creating the interface", () => {
  //   const closeForm = jest.fn();
  //   state.device.errors = null;
  //   const store = mockStore(state);
  //   const Proxy = ({ systemId = "abc123" }) => (
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <CompatRouter>
  //           <AddInterface closeForm={closeForm} systemId={systemId} />
  //         </CompatRouter>
  //       </MemoryRouter>
  //     </Provider>
  //   );
  //   const wrapper = mount(<Proxy />);
  //   const formValues = {
  //     ip_address: "192.168.1.1",
  //     ip_assignment: DeviceIpAssignment.STATIC,
  //     mac_address: "11:22:33:44:55:66",
  //     name: "eth123",
  //     subnet: 2,
  //     tags: ["tag1", "tag2"],
  //   };
  //   submitFormikForm(wrapper, formValues);
  //   const errors = jest.spyOn(deviceSelectors, "eventErrorsForDevices");
  //   errors.mockReturnValue([
  //     deviceEventErrorFactory({
  //       event: "createInterface",
  //     }),
  //   ]);
  //   const creatingInterface = jest.spyOn(deviceSelectors, "getStatusForDevice");
  //   creatingInterface.mockReturnValue(true);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   creatingInterface.mockReturnValue(false);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   expect(closeForm).not.toHaveBeenCalled();
  // });

  // it("does not close the form if there is an error when submitting the form multiple times", () => {
  //   const closeForm = jest.fn();
  //   state.device.errors = null;
  //   const store = mockStore(state);
  //   const Proxy = ({ systemId = "abc123" }) => (
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <CompatRouter>
  //           <AddInterface closeForm={closeForm} systemId={systemId} />
  //         </CompatRouter>
  //       </MemoryRouter>
  //     </Provider>
  //   );
  //   const wrapper = mount(<Proxy />);
  //   const formValues = {
  //     ip_address: "192.168.1.1",
  //     ip_assignment: DeviceIpAssignment.STATIC,
  //     mac_address: "11:22:33:44:55:66",
  //     name: "eth123",
  //     subnet: 2,
  //     tags: ["tag1", "tag2"],
  //   };
  //   submitFormikForm(wrapper, formValues);
  //   const errors = jest.spyOn(deviceSelectors, "eventErrorsForDevices");
  //   errors.mockReturnValue([
  //     deviceEventErrorFactory({
  //       event: "createInterface",
  //     }),
  //   ]);
  //   const creatingInterface = jest.spyOn(deviceSelectors, "getStatusForDevice");
  //   creatingInterface.mockReturnValue(true);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   creatingInterface.mockReturnValue(false);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   errors.mockReturnValue([]);
  //   submitFormikForm(wrapper, formValues);
  //   creatingInterface.mockReturnValue(true);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   creatingInterface.mockReturnValue(false);
  //   // Mock an error for the second submission.
  //   errors.mockReturnValue([
  //     deviceEventErrorFactory({
  //       event: "createInterface",
  //     }),
  //   ]);
  //   // Make the component rerender with the new value.
  //   store.dispatch({ type: "" });
  //   wrapper.setProps({});
  //   expect(closeForm).not.toHaveBeenCalled();
  // });
});
