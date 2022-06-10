import { useEffect, useState } from "react";

import { NotificationSeverity } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import TagFormFields from "./TagFormFields";
import type { TagFormValues } from "./types";

import ActionForm from "app/base/components/ActionForm";
import type { MachineActionFormProps } from "app/machines/types";
import { actions as machineActions } from "app/store/machine";
import type { MachineEventErrors } from "app/store/machine/types";
import { actions as messageActions } from "app/store/message";
import { actions as tagActions } from "app/store/tag";
import tagSelectors from "app/store/tag/selectors";
import type { Tag, TagMeta } from "app/store/tag/types";
import { NodeActions } from "app/store/types/node";

type Props = MachineActionFormProps & { viewingMachineConfig?: boolean };

export enum Label {
  Saved = "Saved all tag changes.",
}

const TagFormSchema = Yup.object().shape({
  added: Yup.array().of(Yup.string()),
  removed: Yup.array().of(Yup.string()),
});

export const TagForm = ({
  clearHeaderContent,
  errors,
  machines,
  processingCount,
  viewingDetails,
  viewingMachineConfig = false,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const tagsLoaded = useSelector(tagSelectors.loaded);
  const [newTags, setNewTags] = useState<Tag[TagMeta.PK][]>([]);

  let formErrors: Record<string, string | string[]> | null = null;
  if (errors && typeof errors === "object" && "name" in errors) {
    formErrors = {
      ...errors,
      added: errors.name,
    } as Record<string, string | string[]>;
    delete formErrors.name;
  }

  useEffect(() => {
    dispatch(tagActions.fetch());
  }, [dispatch]);

  return (
    <ActionForm<TagFormValues, MachineEventErrors>
      actionName={NodeActions.TAG}
      cleanup={machineActions.cleanup}
      errors={formErrors || errors}
      initialValues={{
        added: [],
        removed: [],
      }}
      loaded={tagsLoaded}
      modelName="machine"
      onCancel={clearHeaderContent}
      onSaveAnalytics={{
        action: "Submit",
        category: `Machine ${viewingDetails ? "details" : "list"} action form`,
        label: "Tag",
      }}
      onSubmit={(values) => {
        dispatch(machineActions.cleanup());
        if (values.added.length) {
          machines.forEach((machine) => {
            dispatch(
              machineActions.tag({
                system_id: machine.system_id,
                tags: values.added.map((id) => Number(id)),
              })
            );
          });
        }
        if (values.removed.length) {
          machines.forEach((machine) => {
            dispatch(
              machineActions.untag({
                system_id: machine.system_id,
                tags: values.removed.map((id) => Number(id)),
              })
            );
          });
        }
      }}
      onSuccess={() => {
        clearHeaderContent();
        dispatch(
          messageActions.add(Label.Saved, NotificationSeverity.POSITIVE)
        );
      }}
      processingCount={processingCount}
      showProcessingCount={!viewingMachineConfig}
      submitLabel="Save"
      selectedCount={machines.length}
      validationSchema={TagFormSchema}
    >
      <TagFormFields
        machines={machines}
        newTags={newTags}
        setNewTags={setNewTags}
        viewingDetails={viewingDetails}
        viewingMachineConfig={viewingMachineConfig}
      />
    </ActionForm>
  );
};

export default TagForm;