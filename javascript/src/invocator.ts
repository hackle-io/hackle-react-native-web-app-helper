import { DefaultBrowserPropertyProvider } from "@hackler/javascript-sdk";
import { v4 as uuidv4 } from "uuid";
import { HackleMessage } from "./message";
import { WebViewMessageTransceiver } from "./transceiver";

function invokePromiseExecutor<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason?: any) => void
  ) => void,
  {
    timeoutMillis = 5000,
    onTimeout,
  }: {
    timeoutMillis?: number;
    onTimeout: (
      resolve: (value: T) => void,
      reject: (reason?: any) => void
    ) => void;
  }
) {
  return new Promise<T>((resolve, reject) => {
    executor(resolve, reject);
    setTimeout(() => {
      onTimeout(resolve, reject);
    }, timeoutMillis);
  });
}

export class ReactNativeWebViewInvocator {
  private readonly pendingResolvers = new Map<string, (payload: any) => void>();
  private readonly cleanup: () => void;

  constructor(
    private readonly transceiver: WebViewMessageTransceiver,
    private readonly browserPropertyProvider: DefaultBrowserPropertyProvider
  ) {
    const listener = (e: Event) => {
      const event = e as MessageEvent;
      if (!event.data || event.data === "undefined") return;

      try {
        const data = JSON.parse(event.data);
        const message = HackleMessage.parseOrNull(data);
        if (!message) return;

        const { id, payload } = message;
        this.pendingResolvers.get(id)?.(payload);
        this.pendingResolvers.delete(id);
      } catch (err) {
        console.log(
          `[DEBUG] Hackle: Failed to parse message. If message not sent by hackle, please ignore this. ${err}`
        );
      }
    };

    this.transceiver.addEventListener(listener);
    this.cleanup = () => this.transceiver.cleanUp();
  }

  private createId() {
    return uuidv4();
  }

  private getBrowserProperties(): Record<string, string> {
    return this.browserPropertyProvider.getBrowserProperties() as Record<
      string,
      string
    >;
  }

  private serialize(id: string, type: string, payload: any) {
    const message = HackleMessage.from(
      id,
      type,
      payload,
      this.getBrowserProperties()
    );

    return JSON.stringify(message.toDto());
  }

  invoke<TResponse = any>(
    type: string,
    payload: any,
    {
      timeoutMillis = 5000,
      onTimeout,
    }: { timeoutMillis?: number; onTimeout: () => TResponse }
  ): Promise<TResponse> {
    const id = this.createId();

    return invokePromiseExecutor<TResponse>(
      (resolve) => {
        this.transceiver.port.postMessage(this.serialize(id, type, payload));
        this.pendingResolvers.set(id, resolve);
      },
      {
        timeoutMillis,
        onTimeout: (resolve) => resolve(onTimeout()),
      }
    );
  }
}

export default ReactNativeWebViewInvocator;
