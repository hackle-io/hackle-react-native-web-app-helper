type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export class Emitter<T extends EventMap> {
  private listeners: {
    [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
  } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this.listeners[eventName] = (this.listeners[eventName] || []).concat(fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this.listeners[eventName] = (this.listeners[eventName] || []).filter(
      (f) => f !== fn
    );
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
    (this.listeners[eventName] || []).forEach((fn) => {
      fn(params);
    });
  }
}
