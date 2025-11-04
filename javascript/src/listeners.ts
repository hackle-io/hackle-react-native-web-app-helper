import {
  DefaultBrowserPropertyProvider,
  PageListener,
} from "@hackler/javascript-sdk";
import { WebViewMessageTransceiver } from "./transceiver";
import { HackleMessage } from "./message";

type Page = Parameters<PageListener["onPageStarted"]>[0];
type Timestamp = Parameters<PageListener["onPageStarted"]>[1];

export class AppPageListener implements PageListener {
  constructor(
    private readonly messageTransceiver: WebViewMessageTransceiver,
    private readonly browserPropertyProvider: DefaultBrowserPropertyProvider
  ) {}

  onPageStarted(page: Page, timestamp: Timestamp): void {}

  onPageEnded(page: Page, timestamp: Timestamp): void {}

  private track(page: Page, timestamp: Timestamp): void {
    // TODO: Implement track with messageTransceiver with hacklemessage
  }
}
