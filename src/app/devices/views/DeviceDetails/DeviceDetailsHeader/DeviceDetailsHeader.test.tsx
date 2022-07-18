import { screen, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import DeviceDetailsHeader from "./DeviceDetailsHeader";

import { DeviceHeaderViews } from "app/devices/constants";
import type { RootState } from "app/store/root/types";
import {
  device as deviceFactory,
  deviceDetails as deviceDetailsFactory,
  deviceState as deviceStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("DeviceDetailsHeader", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      device: deviceStateFactory({
        items: [
          deviceDetailsFactory({
            fqdn: "test-machine-69.maas",
            hostname: "test-machine-69",
            system_id: "abc123",
          }),
        ],
      }),
    });
  });

  it("displays a spinner as the title if device has not loaded yet", () => {
    state.device.items = [];
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceDetailsHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByRole("heading", { name: "loading" })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Subtitle loading spinner")
    ).not.toBeInTheDocument();
  });

  it("displays a spinner as the subtitle if loaded device is not the detailed type", () => {
    state.device.items = [deviceFactory({ system_id: "abc123" })];
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceDetailsHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByLabelText("Subtitle loading spinner")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "loading" })
    ).not.toBeInTheDocument();
  });

  it("displays the device's FQDN once loaded", () => {
    state.device.items = [
      deviceDetailsFactory({ fqdn: "plot-device", system_id: "abc123" }),
    ];
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceDetailsHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByRole("heading", { name: "plot-device" })
    ).toBeInTheDocument();
  });

  it("displays action title if an action is selected", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceDetailsHeader
              headerContent={{ view: DeviceHeaderViews.DELETE_DEVICE }}
              setHeaderContent={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole("heading", { name: "Delete" })).toBeInTheDocument();
  });

  it("displays the device name if an action is not selected", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceDetailsHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(
      screen.getByRole("heading", { name: "test-machine-69.maas" })
    ).toBeInTheDocument();
  });
});
