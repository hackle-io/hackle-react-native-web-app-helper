import {
  ContextType,
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import HackleManager from "hackle-js-bridge";

export const HackleContext = createContext({
  userVersion: 0,
  initialized: false,
});

interface ProviderProps {
  hackleClient: ReturnType<HackleManager["createInstance"]>;
  timeout?: number;
}

export default function HackleProvider({
  children,
  hackleClient,
  timeout,
}: PropsWithChildren<ProviderProps>) {
  const [value, setValue] = useState<ContextType<typeof HackleContext>>({
    userVersion: 0,
    initialized: false,
  });

  useEffect(() => {
    hackleClient
      .onInitialized({ timeout })
      .then(
        () => {
          setValue((prevState) => {
            return {
              ...prevState,
              initialized: true,
            };
          });
        },
        () => {
          setValue((prevState) => {
            return {
              ...prevState,
              initialized: true,
            };
          });
        }
      )
      .catch(() => {
        setValue((prevState) => {
          return {
            ...prevState,
            initialized: true,
          };
        });
      });
  }, [hackleClient]);

  useEffect(() => {
    const onUserUpdated = () => {
      setValue((prevState) => ({
        ...prevState,
        userVersion: prevState.userVersion + 1,
      }));
    };

    hackleClient.on("user-updated", onUserUpdated);

    return () => {
      hackleClient.off("user-updated", onUserUpdated);
    };
  }, [hackleClient]);

  return value.initialized ? (
    <HackleContext.Provider value={value}>{children}</HackleContext.Provider>
  ) : null;
}
