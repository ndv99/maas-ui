import ModelActionForm from "@/app/base/components/ModelActionForm";
import type { SetSidePanelContent } from "@/app/base/side-panel-context";

type Props = {
  setSidePanelContent: SetSidePanelContent;
};
const DeleteStaticIP = ({ setSidePanelContent }: Props) => {
  const handleClose = () => setSidePanelContent(null);
  // TODO: Implement onSubmit function and passing IDs when backend and IP tables are ready.
  return (
    <ModelActionForm
      aria-label="Delete static IP"
      initialValues={{}}
      modelType="static IP"
      onCancel={handleClose}
      onSubmit={() => {}}
    />
  );
};

export default DeleteStaticIP;
