import { fetchResourcePools } from "../endpoints";

import { useWebsocketAwareQuery } from "@/app/api/query/base";
import type { ResourcePool } from "@/app/store/resourcepool/types";

const resourcePoolKeys = {
  list: ["resourcepools"] as const,
};

export const useResourcePools = () => {
  return useWebsocketAwareQuery(resourcePoolKeys.list, fetchResourcePools);
};

export const useResourcePoolCount = () =>
  useWebsocketAwareQuery<ResourcePool[], ResourcePool[], number>(
    ["resourcepools"],
    fetchResourcePools,
    {
      select: (data) => data?.length ?? 0,
    }
  );

// export const useResourcePoolById = (id?: ResourcePoolMeta.PK | null) =>
//   useWebsocketAwareQuery(resourcePoolKeys.list, fetchResourcePools, {
//     select: selectById<ResourcePool>(id ?? null),
//   });
