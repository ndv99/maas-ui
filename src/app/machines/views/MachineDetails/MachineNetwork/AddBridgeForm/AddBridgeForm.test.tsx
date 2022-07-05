// import { mount } from "enzyme";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import AddBridgeForm from "./AddBridgeForm";

import type { RootState } from "app/store/root/types";
import { NetworkInterfaceTypes, NetworkLinkMode } from "app/store/types/enum";
import type { NetworkInterface } from "app/store/types/node";
import {
  machineDetails as machineDetailsFactory,
  machineInterface as machineInterfaceFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("AddBridgeForm", () => {
  let nic: NetworkInterface;
  let state: RootState;
  beforeEach(() => {
    nic = machineInterfaceFactory({
      type: NetworkInterfaceTypes.PHYSICAL,
    });
    state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            interfaces: [nic],
            system_id: "abc123",
          }),
        ],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
        }),
      }),
    });
  });

  it("displays a table", () => {
    const nic = machineInterfaceFactory({
      type: NetworkInterfaceTypes.PHYSICAL,
    });
    state.machine.items = [
      machineDetailsFactory({
        system_id: "abc123",
        interfaces: [nic],
      }),
    ];
    const selected = [{ nicId: nic.id }];
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <AddBridgeForm
              close={jest.fn()}
              selected={selected}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("fetches the necessary data on load", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <AddBridgeForm
              close={jest.fn()}
              selected={[{ nicId: nic.id }]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(store.getActions().some((action) => action.type === "vlan/fetch"));
  });

  it("displays a spinner when data is loading", () => {
    state.vlan.loaded = false;
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <AddBridgeForm
              close={jest.fn()}
              selected={[{ nicId: nic.id }]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    const loadingSpinners = screen.getAllByText("Loading");
    loadingSpinners.forEach((loadingSpinner) => {
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner.classList.contains("p-icon--spinner")).toBe(true);
      expect(loadingSpinner.classList.contains("u-animation--spin")).toBe(true);
    });
  });

  it("can dispatch an action to add a bridge", async () => {
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <AddBridgeForm
              close={jest.fn()}
              selected={[{ nicId: nic.id }]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    //   act(() =>
    //     submitFormikForm(wrapper, {
    //       bridge_fd: 15,
    //       bridge_stp: false,
    //       fabric: 1,
    //       ip_address: "1.2.3.4",
    //       mac_address: "28:21:c6:b9:1b:22",
    //       mode: NetworkLinkMode.LINK_UP,
    //       name: "br1",
    //       subnet: 1,
    //       tags: ["a", "tag"],
    //       vlan: 1,
    //     })
    //   );

    const button = screen.getByRole("button", { name: "Save interface" });
    // await userEvent.click(button);

    //   expect(
    //     store
    //       .getActions()
    //       .find((action) => action.type === "machine/createBridge")
    //   ).toStrictEqual({
    //     type: "machine/createBridge",
    //     meta: {
    //       model: "machine",
    //       method: "create_bridge",
    //     },
    //     payload: {
    //       params: {
    //         bridge_fd: 15,
    //         bridge_stp: false,
    //         fabric: 1,
    //         ip_address: "1.2.3.4",
    //         mac_address: "28:21:c6:b9:1b:22",
    //         mode: NetworkLinkMode.LINK_UP,
    //         name: "br1",
    //         parents: [nic.id],
    //         subnet: 1,
    //         system_id: "abc123",
    //         tags: ["a", "tag"],
    //         vlan: 1,
    //       },
    //     },
    //   });
  });
});
