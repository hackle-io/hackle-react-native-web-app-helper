import { PageListener } from "@hackler/javascript-sdk";
import ReactNativeWebViewInvocator from "../invocator";

type Page = Parameters<PageListener["onPageStarted"]>[0];
type Timestamp = Parameters<PageListener["onPageStarted"]>[1];

export class AppPageListener implements PageListener {
  static PAGE_VIEW_EVENT_KEY = "$page_view";
  static PAGE_NAME_PROPERTY_KEY = "$page_name";

  constructor(private readonly invocator: ReactNativeWebViewInvocator) {}

  onPageStarted(page: Page, timestamp: Timestamp): void {
    this.track(page, timestamp);
  }

  onPageEnded(_page: Page, _timestamp: Timestamp): void {}

  private track(page: Page, _timestamp: Timestamp): void {
    const event = {
      key: AppPageListener.PAGE_VIEW_EVENT_KEY,
      properties: {
        [AppPageListener.PAGE_NAME_PROPERTY_KEY]: page.pageTitle,
      },
    };

    this.invocator
      .invoke<void>("track", { event }, { onTimeout: () => undefined })
      .catch(() => {
        // ignore
      });
  }
}
