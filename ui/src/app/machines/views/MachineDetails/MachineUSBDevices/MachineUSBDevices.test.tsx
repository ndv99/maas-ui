import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import MachineUSBDevices from "./MachineUSBDevices";

import { HardwareType } from "app/base/enum";
import { NodeDeviceBus } from "app/store/nodedevice/types";
import { NodeActions } from "app/store/types/node";
import {
  machineDetails as machineDetailsFactory,
  machineNumaNode as numaNodeFactory,
  machineState as machineStateFactory,
  nodeDevice as nodeDeviceFactory,
  nodeDeviceState as nodeDeviceStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("MachineUSBDevices", () => {
  it("shows placeholder rows while USB devices are loading", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
          }),
        ],
      }),
      nodedevice: nodeDeviceStateFactory({ loading: true }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Placeholder").exists()).toBe(true);
  });

  it(`prompts user to commission machine if no USB info available and machine
    can be commissioned`, () => {
    const setSelectedAction = jest.fn();
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            actions: [NodeActions.COMMISSION],
            system_id: "abc123",
          }),
        ],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={setSelectedAction} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='information-unavailable']").exists()).toBe(
      true
    );

    wrapper.find("[data-test='commission-machine'] button").simulate("click");

    expect(setSelectedAction).toHaveBeenCalledWith({
      name: NodeActions.COMMISSION,
    });
  });

  it("shows a message if no USB devices have been detected", () => {
    const machine = machineDetailsFactory({ system_id: "abc123" });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machine],
      }),
      nodedevice: nodeDeviceStateFactory({
        items: [
          nodeDeviceFactory({
            bus: NodeDeviceBus.PCIE,
            node_id: machine.id,
          }),
        ],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='no-usb']").exists()).toBe(true);
  });

  it("groups USB devices by hardware type", () => {
    const machine = machineDetailsFactory({ system_id: "abc123" });
    const networkDevices = [
      nodeDeviceFactory({
        bus: NodeDeviceBus.USB,
        hardware_type: HardwareType.Network,
        node_id: machine.id,
      }),
    ];
    const storageDevices = Array.from(Array(3)).map(() =>
      nodeDeviceFactory({
        bus: NodeDeviceBus.USB,
        hardware_type: HardwareType.Storage,
        node_id: machine.id,
      })
    );
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machine],
      }),
      nodedevice: nodeDeviceStateFactory({
        items: [...networkDevices, ...storageDevices],
        loading: false,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find("[data-test='group-label']")
        .at(0)
        .find(".p-double-row__primary-row")
        .text()
    ).toBe("Network");
    expect(
      wrapper
        .find("[data-test='group-label']")
        .at(0)
        .find(".p-double-row__secondary-row")
        .text()
    ).toBe("1 device");
    expect(
      wrapper
        .find("[data-test='group-label']")
        .at(1)
        .find(".p-double-row__primary-row")
        .text()
    ).toBe("Storage");
    expect(
      wrapper
        .find("[data-test='group-label']")
        .at(1)
        .find(".p-double-row__secondary-row")
        .text()
    ).toBe("3 devices");
  });

  it("can link to the network and storage tabs", () => {
    const machine = machineDetailsFactory({ system_id: "abc123" });
    const networkDevice = nodeDeviceFactory({
      bus: NodeDeviceBus.USB,
      hardware_type: HardwareType.Network,
      node_id: machine.id,
    });
    const storageDevice = nodeDeviceFactory({
      bus: NodeDeviceBus.USB,
      hardware_type: HardwareType.Storage,
      node_id: machine.id,
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machine],
      }),
      nodedevice: nodeDeviceStateFactory({
        items: [networkDevice, storageDevice],
        loading: false,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("[data-test='group-label']").at(0).find("Link").prop("to")
    ).toBe("/machine/abc123/network");
    expect(
      wrapper.find("[data-test='group-label']").at(1).find("Link").prop("to")
    ).toBe("/machine/abc123/storage");
  });

  it("displays the NUMA node index of a USB device", () => {
    const numaNode = numaNodeFactory({ index: 128 });
    const machine = machineDetailsFactory({
      numa_nodes: [numaNode, numaNodeFactory()],
      system_id: "abc123",
    });
    const pciDevice = nodeDeviceFactory({
      bus: NodeDeviceBus.USB,
      node_id: machine.id,
      numa_node_id: numaNode.id,
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machine],
      }),
      nodedevice: nodeDeviceStateFactory({
        items: [pciDevice],
        loading: false,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => (
              <MachineUSBDevices setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='usb-numa']").text()).toBe("128");
  });
});
