import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import ZoneDetailsForm from "./ZoneDetailsForm";

import type { RootState } from "app/store/root/types";
import {
  zone as zoneFactory,
  zoneState as zoneStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("ZoneDetailsForm", () => {
  const testZone = zoneFactory();
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      zone: zoneStateFactory({
        errors: {},
        loading: false,
        loaded: true,
        items: [testZone],
      }),
    });
  });

  it("runs closeForm function when the cancel button is clicked", async () => {
    const closeForm = jest.fn();
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <ZoneDetailsForm closeForm={closeForm} id={testZone.id} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    // wrapper.find("button[data-testid='cancel-action']").simulate("click");
    // expect(closeForm).toHaveBeenCalled();
    await userEvent.click(screen.getByTestId("cancel-action"));
    expect(closeForm).toHaveBeenCalled();
  });

  // it("calls actions.update on save click", () => {
  //   const store = mockStore(initialState);
  //   const wrapper = mount(
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <CompatRouter>
  //           <ZoneDetailsForm closeForm={jest.fn()} id={testZone.id} />
  //         </CompatRouter>
  //       </MemoryRouter>
  //     </Provider>
  //   );
  //   act(() =>
  //     submitFormikForm(wrapper, {
  //       id: testZone.id,
  //       description: testZone.description,
  //       name: testZone.name,
  //     })
  //   );

  //   expect(
  //     store.getActions().find((action) => action.type === "zone/update")
  //   ).toStrictEqual({
  //     type: "zone/update",
  //     meta: {
  //       method: "update",
  //       model: "zone",
  //     },
  //     payload: {
  //       params: {
  //         id: testZone.id,
  //         description: testZone.description,
  //         name: testZone.name,
  //       },
  //     },
  //   });
  // });
});
