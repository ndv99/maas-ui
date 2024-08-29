import { getCookie } from "@/app/utils";

export const API_ENDPOINTS = {
  resource_pools: "resource_pools",
  zones: "zones",
} as const;

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const handleErrors = (response: Response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

type ApiVersion = "v2" | "v3";
type ApiEndpoint = typeof API_ENDPOINTS;
export type ApiEndpointKey = keyof ApiEndpoint;
type ApiUrl = `/MAAS/a/${ApiVersion}/${ApiEndpoint[ApiEndpointKey]}`;

export const getFullApiUrl = (
  endpoint: ApiEndpointKey,
  apiVersion: ApiVersion
): ApiUrl => `/MAAS/a/${apiVersion}/${API_ENDPOINTS[endpoint]}`;

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const csrftoken = getCookie("csrftoken");
  const headers = {
    ...DEFAULT_HEADERS,
    "X-CSRFToken": csrftoken || "",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return handleErrors(response).json();
};
