export class WebViewMessageTransceiver {
  cleanUp: () => void = () => {};

  constructor(readonly port: Port) {}

  addEventListener(_listener: EventListener) {
    // to work in both Android and iOS, useCapture should be true
    window.addEventListener("message", _listener, true);
    this.cleanUp = () => window.removeEventListener("message", _listener, true);
  }
}

export interface Port {
  postMessage(serialized: string): void;
}
