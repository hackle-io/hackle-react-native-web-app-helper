"use client";

import { useContext } from "react";
import hackleClient from "../modules/client";
import { HackleContext } from "../context";
import { useAsyncClient } from "./useAsyncClient";

export default function useRemoteConfig<T>(
  key: string,
  defaultConfig: T,
  options?: {
    suspense: boolean;
  }
) {
  const { userVersion } = useContext(HackleContext);
  const { data: config, isLoading } = useAsyncClient<T>(
    async (): Promise<T> => {
      const remoteConfig = hackleClient.remoteConfig();

      switch (typeof defaultConfig) {
        case "number":
          return (await remoteConfig.get(key, defaultConfig)) as T;
        case "boolean":
          return (await remoteConfig.get(key, defaultConfig)) as T;
        case "string":
        default: {
          const value = await remoteConfig.get(
            key,
            JSON.stringify(defaultConfig)
          );
          try {
            return JSON.parse(value) as T;
          } catch {
            return value as T;
          }
        }
      }
    },
    [userVersion],
    options
  );

  return {
    config: config ?? defaultConfig,
    isLoading,
  };
}
