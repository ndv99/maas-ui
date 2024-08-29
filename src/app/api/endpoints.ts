import { fetchWithAuth, getFullApiUrl } from "@/app/api/base";
import type { ResourcePool } from "@/app/store/resourcepool/types";
import type { Zone } from "@/app/store/zone/types";

export const fetchZones = (): Promise<Zone[]> =>
  fetchWithAuth(getFullApiUrl("zones", "v2"));

export const fetchResourcePools = (): Promise<ResourcePool[]> =>
  fetchWithAuth(getFullApiUrl("resource_pools", "v3"));
