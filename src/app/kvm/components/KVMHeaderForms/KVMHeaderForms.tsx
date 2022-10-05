import { useCallback } from "react";

import { useSelector } from "react-redux";

import AddLxd from "./AddLxd";
import AddVirsh from "./AddVirsh";
import ComposeForm from "./ComposeForm";
import DeleteForm from "./DeleteForm";
import RefreshForm from "./RefreshForm";

import { useScrollOnRender } from "app/base/hooks";
import type { ClearHeaderContent, SetSearchFilter } from "app/base/types";
import { KVMHeaderViews } from "app/kvm/constants";
import type { KVMHeaderContent, KVMSetHeaderContent } from "app/kvm/types";
import MachineHeaderForms from "app/machines/components/MachineHeaderForms";
import type { MachineHeaderContent } from "app/machines/types";
import machineSelectors from "app/store/machine/selectors";
import type { FetchFilters } from "app/store/machine/types";
import { selectedToFilters } from "app/store/machine/utils";

type Props = {
  headerContent: KVMHeaderContent | null;
  setHeaderContent: KVMSetHeaderContent;
  setSearchFilter?: SetSearchFilter;
};

const getFormComponent = (
  headerContent: KVMHeaderContent,
  setHeaderContent: KVMSetHeaderContent,
  clearHeaderContent: ClearHeaderContent,
  selectedFilter: FetchFilters | null,
  setSearchFilter?: SetSearchFilter
) => {
  if (!headerContent) {
    return null;
  }

  if (headerContent.view === KVMHeaderViews.ADD_LXD_HOST) {
    return <AddLxd clearHeaderContent={clearHeaderContent} />;
  }

  if (headerContent.view === KVMHeaderViews.ADD_VIRSH_HOST) {
    return <AddVirsh clearHeaderContent={clearHeaderContent} />;
  }

  // The following forms require that a host or cluster id be passed to it.
  const hostId =
    headerContent.extras && "hostId" in headerContent.extras
      ? headerContent.extras.hostId
      : null;
  const clusterId =
    headerContent.extras && "clusterId" in headerContent.extras
      ? headerContent.extras.clusterId
      : null;
  if (
    headerContent.view === KVMHeaderViews.COMPOSE_VM &&
    (hostId || hostId === 0)
  ) {
    return (
      <ComposeForm clearHeaderContent={clearHeaderContent} hostId={hostId} />
    );
  }
  if (
    headerContent.view === KVMHeaderViews.DELETE_KVM &&
    (hostId || hostId === 0 || clusterId || clusterId === 0)
  ) {
    return (
      <DeleteForm
        clearHeaderContent={clearHeaderContent}
        clusterId={clusterId}
        hostId={hostId}
      />
    );
  }

  if (
    headerContent.view === KVMHeaderViews.REFRESH_KVM &&
    headerContent.extras &&
    "hostIds" in headerContent.extras &&
    headerContent.extras.hostIds?.length
  ) {
    return (
      <RefreshForm
        clearHeaderContent={clearHeaderContent}
        hostIds={headerContent.extras.hostIds}
      />
    );
  }
  // We need to explicitly cast headerContent here - TypeScript doesn't
  // seem to be able to infer remaining object tuple values as with string
  // values.
  // https://github.com/canonical/maas-ui/issues/3040
  const machineHeaderContent = headerContent as MachineHeaderContent;
  return (
    <MachineHeaderForms
      headerContent={machineHeaderContent}
      selectedFilter={selectedFilter}
      setHeaderContent={setHeaderContent}
      setSearchFilter={setSearchFilter}
      viewingDetails={false}
    />
  );
};

const KVMHeaderForms = ({
  headerContent,
  setHeaderContent,
  setSearchFilter,
}: Props): JSX.Element | null => {
  const selectedMachines = useSelector(machineSelectors.selectedMachines);
  const selectedFilter = selectedToFilters(selectedMachines);
  const onRenderRef = useScrollOnRender<HTMLDivElement>();
  const clearHeaderContent = useCallback(
    () => setHeaderContent(null),
    [setHeaderContent]
  );

  if (!headerContent) {
    return null;
  }
  return (
    <div ref={onRenderRef}>
      {getFormComponent(
        headerContent,
        setHeaderContent,
        clearHeaderContent,
        selectedFilter,
        setSearchFilter
      )}
    </div>
  );
};

export default KVMHeaderForms;
