import {
  Decision,
  FeatureFlagDecision,
  HackleEvent,
  HackleInAppMessageView,
  HackleSubscriptionOperations,
  PageView,
  PropertyOperations,
  User,
} from "@hackler/javascript-sdk";
import { WebViewConfig } from "./remote-config";
import { Emitter } from "./emitter";

export interface HackleClientBase
  extends Emitter<{
    "user-updated": string;
  }> {
  getSessionId: () => Promise<string>;
  getUser: () => Promise<User>;
  setUser: (user: User) => Promise<void>;
  setUserId: (userId: string | undefined | null) => Promise<void>;
  setDeviceId: (deviceId: string) => Promise<void>;
  setUserProperty: (key: string, value: any) => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  updateUserProperties: (operations: PropertyOperations) => Promise<void>;
  updatePushSubscriptions: (
    operations: HackleSubscriptionOperations
  ) => Promise<void>;
  updateSmsSubscriptions: (
    operations: HackleSubscriptionOperations
  ) => Promise<void>;
  updateKakaoSubscriptions: (
    operations: HackleSubscriptionOperations
  ) => Promise<void>;
  setPhoneNumber: (phoneNumber: string) => Promise<void>;
  unsetPhoneNumber: () => Promise<void>;
  resetUser: () => Promise<void>;
  variation: (experimentKey: number) => Promise<string>;
  variationDetail: (experimentKey: number) => Promise<Decision>;
  isFeatureOn: (featureKey: number) => Promise<boolean>;
  featureFlagDetail: (featureKey: number) => Promise<FeatureFlagDecision>;
  track: (event: HackleEvent) => Promise<void>;
  trackPageView: (option?: PageView) => Promise<void>;
  remoteConfig: () => WebViewConfig;
  showUserExplorer: () => Promise<void>;
  hideUserExplorer: () => Promise<void>;
  fetch: () => Promise<void>;
  onInitialized(config?: { timeout?: number }): Promise<{
    success: boolean;
  }>;
  getDisplayedInAppMessage: () => Promise<HackleInAppMessageView | null>;
}
