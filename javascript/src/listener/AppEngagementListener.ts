import { EngagementListener } from "@hackler/javascript-sdk";
import ReactNativeWebViewInvocator from "../invocator";

type Engagement = Parameters<EngagementListener["onEngagement"]>[0];
type Timestamp = Parameters<EngagementListener["onEngagement"]>[1];

export class AppEngagementListener implements EngagementListener {
  static ENGAGEMENT_EVENT_KEY = "$engagement";
  static ENGAGEMENT_TIME_PROPERTY_KEY = "$engagement_time_ms";
  static ENGAGEMENT_PAGE_NAME_KEY = "$page_name";

  constructor(private readonly invocator: ReactNativeWebViewInvocator) {}

  onEngagement(engagement: Engagement, _timestamp: Timestamp): void {
    const event = {
      key: AppEngagementListener.ENGAGEMENT_EVENT_KEY,
      properties: {
        [AppEngagementListener.ENGAGEMENT_PAGE_NAME_KEY]:
          engagement.page.pageTitle,
        [AppEngagementListener.ENGAGEMENT_TIME_PROPERTY_KEY]:
          engagement.durationMillis,
      },
    };

    this.invocator
      .invoke<void>("track", { event }, { onTimeout: () => undefined })
      .catch(() => {
        // ignore
      });
  }
}
