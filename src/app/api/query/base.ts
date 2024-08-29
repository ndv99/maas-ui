import { useEffect, useCallback, useContext } from "react";

import { usePrevious } from "@canonical/react-components";
import type { QueryFunction, UseQueryOptions } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import type { QueryKey } from "@/app/api/query-client";
import { WebSocketContext } from "@/app/base/websocket-context";
import statusSelectors from "@/app/store/status/selectors";
import type { WebSocketEndpointModel } from "@/websocket-client";
import { WebSocketMessageType } from "@/websocket-client";

export const useWebSocket = () => {
  const websocketClient = useContext(WebSocketContext);

  if (!websocketClient) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  const subscribe = useCallback(
    (callback: (msg: any) => void) => {
      if (!websocketClient.rws) return;

      const messageHandler = (messageEvent: MessageEvent) => {
        const data = JSON.parse(messageEvent.data);
        if (data.type === WebSocketMessageType.NOTIFY) callback(data);
      };
      websocketClient.rws.addEventListener("message", messageHandler);
      return () =>
        websocketClient.rws?.removeEventListener("message", messageHandler);
    },
    [websocketClient]
  );

  return { subscribe };
};

const wsToQueryKeyMapping: Partial<Record<WebSocketEndpointModel, string>> = {
  resourcepool: "resourcepools",
  zone: "zones",
  // Add more mappings as needed
} as const;
export function useWebsocketAwareQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    "queryKey" | "queryFn"
  >
) {
  const queryClient = useQueryClient();
  const connectedCount = useSelector(statusSelectors.connectedCount);
  const { subscribe } = useWebSocket();

  const queryModelKey = Array.isArray(queryKey) ? queryKey[0] : "";
  const previousConnectedCount = usePrevious(connectedCount);

  useEffect(() => {
    if (connectedCount !== previousConnectedCount) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [connectedCount, previousConnectedCount, queryClient, queryKey]);

  useEffect(() => {
    return subscribe(
      ({ name: model }: { action: string; name: WebSocketEndpointModel }) => {
        const mappedKey = wsToQueryKeyMapping[model];
        const modelQueryKey = queryKey[0];

        if (mappedKey && mappedKey === modelQueryKey) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    );
  }, [queryClient, subscribe, queryModelKey, queryKey]);

  return useQuery<TQueryFnData, TError, TData>({
    queryKey,
    queryFn,
    ...options,
  });
}
