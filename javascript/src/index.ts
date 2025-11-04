import { Emitter } from "./emitter";
import {
  Config,
  createInstance,
  Decision,
  DecisionReason,
  FeatureFlagDecision,
  HackleEvent,
  HackleSubscriptionOperations,
  PageView,
  PropertyOperations,
  User,
  DefaultBrowserPropertyProvider,
  HackleInAppMessageView,
  WebViewLifecycleCompositeManager,
} from "@hackler/javascript-sdk";

import WebViewParameterConfig from "./parameter-config";
import WebViewRemoteConfig from "./remote-config";
import { HackleClientBase } from "./base";
import { WebViewMessageTransceiver, Port } from "./transceiver";
import { AppPageListener } from "./listener/AppPageListener";
import ReactNativeWebViewInvocator from "./invocator";
import { AppEngagementListener } from "./listener/AppEngagementListener";

declare global {
  interface Window {
    ReactNativeWebView: Port;

    _hackle_injected: boolean;
    _hackleApp?: {
      getWebViewConfig?: () => string;
    };
  }
}

interface WebViewConfig {
  automaticScreenTracking: boolean;
  automaticEngagementTracking: boolean;
}

function getWebViewConfig(): WebViewConfig {
  const DEFAULT_WEBVIEW_CONFIG: WebViewConfig = {
    automaticScreenTracking: false,
    automaticEngagementTracking: false,
  };

  try {
    const seralizedWebViewConfig = window._hackleApp?.getWebViewConfig?.();
    if (seralizedWebViewConfig) {
      return JSON.parse(seralizedWebViewConfig);
    }
  } catch (err) {
    console.error(`[DEBUG] Hackle: Failed to parse web view config. ${err}`);
  }

  return DEFAULT_WEBVIEW_CONFIG;
}

function createWebViewClient(
  sdkKey: string,
  config: Config,
  messageTransceiver: WebViewMessageTransceiver,
  lifecycleCompositeManager: WebViewLifecycleCompositeManager
) {
  const webViewConfig = getWebViewConfig();

  const browserPropertyProvider = new DefaultBrowserPropertyProvider();
  const messenger = new ReactNativeWebViewInvocator(
    messageTransceiver,
    browserPropertyProvider
  );
  const pageListener = new AppPageListener(messenger);
  const engagementListener = new AppEngagementListener(messenger);

  if (webViewConfig.automaticScreenTracking) {
    lifecycleCompositeManager.addPageListener(pageListener);
  }

  if (webViewConfig.automaticEngagementTracking) {
    lifecycleCompositeManager.addEngagementListener(engagementListener);
  }

  const browserName =
    browserPropertyProvider.getBrowserProperties()["browserName"] || null;
  lifecycleCompositeManager.install(
    typeof browserName === "string" ? browserName : null
  );

  const client = new HackleWebViewClient(sdkKey, config, messenger);

  lifecycleCompositeManager.initialize();
  return client;
}

/**
 * WebView 여부에 따라 다른 인스턴스를 반환하도록 하는 Wrapper
 * @example const hackleClient = new HackleManager().createInstance("SDK_KEY")
 */
class HackleManager {
  private injectFlag = "_hackle_injected" as const;

  private isInjectedEnvironment() {
    if (typeof window === "undefined" || !window.ReactNativeWebView)
      return false;

    return window[this.injectFlag] === true;
  }
  createInstance(sdkKey: string, config: Config): HackleClientBase {
    if (this.isInjectedEnvironment()) {
      const lifecycleCompositeManager = new WebViewLifecycleCompositeManager();

      const messageTransceiver = new WebViewMessageTransceiver(
        window.ReactNativeWebView
      );

      return createWebViewClient(
        sdkKey,
        config,
        messageTransceiver,
        lifecycleCompositeManager
      );
    }

    return new HackleWebOnlyClient(sdkKey, config);
  }
}

/**
 * ReactNative WebView 환경에서만 동작하는 HackleClient
 */
class HackleWebViewClient
  extends Emitter<{
    "user-updated": string;
  }>
  implements HackleClientBase
{
  constructor(
    private readonly sdkKey: string,
    private readonly config: Config,
    private readonly messenger: ReactNativeWebViewInvocator
  ) {
    super();
  }
  onInitialized(config?: { timeout?: number }): Promise<{ success: boolean }> {
    return Promise.resolve({ success: true });
  }

  async getSessionId() {
    const { sessionId } = await this.messenger.invoke<{ sessionId: string }>(
      "getSessionId",
      null,
      { onTimeout: () => ({ sessionId: "" }) }
    );

    return sessionId;
  }

  async getUser() {
    const { user } = await this.messenger.invoke<{ user: User }>(
      "getUser",
      null,
      {
        onTimeout: () => ({ user: {} as User }),
      }
    );

    return user;
  }

  private emitUserUpdated() {
    this.emit("user-updated", JSON.stringify(this.getUser()));
  }

  async setUser(user: User) {
    return this.messenger
      .invoke<void>("setUser", { user }, { onTimeout: () => undefined })
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async setUserId(userId: string | undefined | null) {
    let resolvedUserId = userId;
    if (userId === undefined || userId === null) {
      resolvedUserId = null as any;
    }

    return this.messenger
      .invoke<void>(
        "setUserId",
        { userId: resolvedUserId },
        { onTimeout: () => undefined }
      )
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async setDeviceId(deviceId: string) {
    return this.messenger
      .invoke<void>("setDeviceId", { deviceId }, { onTimeout: () => undefined })
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async setUserProperty(key: string, value: any) {
    return this.messenger
      .invoke<void>(
        "setUserProperty",
        { key, value },
        { onTimeout: () => undefined }
      )
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async setUserProperties(properties: Record<string, any>) {
    return this.messenger
      .invoke<void>(
        "setUserProperties",
        { properties },
        { onTimeout: () => undefined }
      )
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async updateUserProperties(operations: PropertyOperations) {
    return this.messenger
      .invoke<void>(
        "updateUserProperties",
        { operations: operations.toRecord() },
        { onTimeout: () => undefined }
      )
      .then(() => {
        this.emitUserUpdated();
      });
  }

  updatePushSubscriptions(operations: HackleSubscriptionOperations) {
    return this.messenger.invoke<void>(
      "updatePushSubscriptions",
      { operations: operations.toRecord() },
      { onTimeout: () => undefined }
    );
  }

  updateSmsSubscriptions(operations: HackleSubscriptionOperations) {
    return this.messenger.invoke<void>(
      "updateSmsSubscriptions",
      { operations: operations.toRecord() },
      { onTimeout: () => undefined }
    );
  }

  updateKakaoSubscriptions(operations: HackleSubscriptionOperations) {
    return this.messenger.invoke<void>(
      "updateKakaoSubscriptions",
      { operations: operations.toRecord() },
      { onTimeout: () => undefined }
    );
  }

  setPhoneNumber(phoneNumber: string) {
    return this.messenger.invoke<void>(
      "setPhoneNumber",
      { phoneNumber },
      { onTimeout: () => undefined }
    );
  }

  unsetPhoneNumber() {
    return this.messenger.invoke<void>("unsetPhoneNumber", null, {
      onTimeout: () => undefined,
    });
  }

  async resetUser() {
    return this.messenger
      .invoke<void>("resetUser", null, { onTimeout: () => undefined })
      .then(() => {
        this.emitUserUpdated();
      });
  }

  async variation(experimentKey: number): Promise<string> {
    const { variation } = await this.messenger.invoke<{ variation: string }>(
      "variation",
      { experimentKey },
      { onTimeout: () => ({ variation: "A" }) }
    );
    return variation;
  }

  async variationDetail(experimentKey: number) {
    try {
      const { variation, reason, parameters } = await this.messenger.invoke<{
        variation: string;
        reason: DecisionReason;
        parameters: Record<string, string | number | boolean>;
      }>(
        "variationDetail",
        { experimentKey },
        {
          onTimeout: () => {
            throw new Error("timeout");
          },
        }
      );

      return Decision.of(
        variation,
        reason,
        new WebViewParameterConfig(parameters ?? {})
      );
    } catch {
      return Decision.of("A", DecisionReason.EXCEPTION);
    }
  }

  async isFeatureOn(featureKey: number) {
    const { isOn } = await this.messenger.invoke<{ isOn: boolean }>(
      "isFeatureOn",
      { featureKey },
      { onTimeout: () => ({ isOn: false }) }
    );

    return isOn;
  }

  async featureFlagDetail(featureKey: number) {
    try {
      const { isOn, reason, parameters } = await this.messenger.invoke<{
        isOn: boolean;
        reason: DecisionReason;
        parameters: Record<string, string | number | boolean>;
      }>(
        "featureFlagDetail",
        { featureKey },
        {
          onTimeout: () => {
            throw new Error("timeout");
          },
        }
      );
      return new FeatureFlagDecision(
        isOn,
        reason,
        new WebViewParameterConfig(parameters ?? {}),
        undefined
      );
    } catch {
      return FeatureFlagDecision.off(DecisionReason.EXCEPTION);
    }
  }

  track(event: HackleEvent) {
    return this.messenger.invoke<void>(
      "track",
      { event },
      { onTimeout: () => undefined }
    );
  }

  async trackPageView() {
    // not implemented
  }

  remoteConfig() {
    const remoteConfigGetter: ConstructorParameters<
      typeof WebViewRemoteConfig
    >[0] = (key: string, defaultValue: any, valueType: string) => {
      return this.messenger.invoke<{ configValue: string | number | boolean }>(
        "remoteConfig",
        { key, defaultValue, valueType },
        { onTimeout: () => defaultValue }
      );
    };

    return new WebViewRemoteConfig(remoteConfigGetter);
  }

  showUserExplorer() {
    return this.messenger.invoke<void>("showUserExplorer", null, {
      onTimeout: () => undefined,
    });
  }

  async hideUserExplorer() {
    return this.messenger.invoke<void>("hideUserExplorer", null, {
      onTimeout: () => undefined,
    });
  }

  fetch() {
    return this.messenger.invoke<void>("fetch", null, {
      onTimeout: () => undefined,
    });
  }

  getDisplayedInAppMessage(): Promise<null> {
    console.log(
      `[DEBUG] Hackle: getDisplayedInAppMessage is not supported in React Native WebView environment.`
    );
    return Promise.resolve(null);
  }
}

/**
 * React Native WebView 환경이 아닌 경우 사용되는 hackleClient
 */
class HackleWebOnlyClient
  extends Emitter<{
    "user-updated": string;
  }>
  implements HackleClientBase
{
  client;
  constructor(sdkKey: string, config: Config) {
    super();
    this.client = createInstance(sdkKey, config);
  }

  private emitUserUpdated() {
    this.emit("user-updated", JSON.stringify(this.getUser()));
  }

  getSessionId() {
    return Promise.resolve(this.client.getSessionId());
  }

  getUser() {
    return Promise.resolve(this.client.getUser());
  }

  async setUser(user: User) {
    return Promise.resolve(this.client.setUser(user)).then(() => {
      this.emitUserUpdated();
    });
  }

  async setUserId(userId: string | undefined | null) {
    return Promise.resolve(this.client.setUserId(userId)).then(() => {
      this.emitUserUpdated();
    });
  }

  async setDeviceId(deviceId: string) {
    return Promise.resolve(this.client.setDeviceId(deviceId)).then(() => {
      this.emitUserUpdated();
    });
  }
  async setUserProperty(key: string, value: any) {
    return Promise.resolve(this.client.setUserProperty(key, value)).then(() => {
      this.emitUserUpdated();
    });
  }
  async setUserProperties(properties: Record<string, any>) {
    return Promise.resolve(this.client.setUserProperties(properties)).then(
      () => {
        this.emitUserUpdated();
      }
    );
  }
  async updateUserProperties(operations: PropertyOperations) {
    return Promise.resolve(this.client.updateUserProperties(operations)).then(
      () => {
        this.emitUserUpdated();
      }
    );
  }
  updatePushSubscriptions(operations: HackleSubscriptionOperations) {
    return Promise.resolve(this.client.updatePushSubscriptions(operations));
  }
  updateSmsSubscriptions(operations: HackleSubscriptionOperations) {
    return Promise.resolve(this.client.updateSmsSubscriptions(operations));
  }
  updateKakaoSubscriptions(operations: HackleSubscriptionOperations) {
    return Promise.resolve(this.client.updateKakaoSubscriptions(operations));
  }
  setPhoneNumber(phoneNumber: string) {
    return Promise.resolve(this.client.setPhoneNumber(phoneNumber));
  }
  unsetPhoneNumber() {
    return Promise.resolve(this.client.unsetPhoneNumber());
  }
  async resetUser() {
    return Promise.resolve(this.client.resetUser()).then(() => {
      this.emitUserUpdated();
    });
  }
  variation(experimentKey: number) {
    return Promise.resolve(this.client.variation(experimentKey));
  }
  variationDetail(experimentKey: number) {
    return Promise.resolve(this.client.variationDetail(experimentKey));
  }
  isFeatureOn(featureKey: number) {
    return Promise.resolve(this.client.isFeatureOn(featureKey));
  }
  featureFlagDetail(featureKey: number) {
    return Promise.resolve(this.client.featureFlagDetail(featureKey));
  }
  track(event: HackleEvent) {
    return Promise.resolve(this.client.track(event));
  }
  trackPageView(option?: PageView) {
    return Promise.resolve(this.client.trackPageView(option));
  }
  remoteConfig() {
    const originConfigFetcher: ConstructorParameters<
      typeof WebViewRemoteConfig
    >[0] = (key: string, defaultValue: any, valueType: string) => {
      const value = this.client.remoteConfig().get(key, defaultValue);
      return Promise.resolve({ configValue: value });
    };

    return new WebViewRemoteConfig(originConfigFetcher);
  }
  showUserExplorer() {
    return Promise.resolve(this.client.showUserExplorer());
  }
  hideUserExplorer() {
    return Promise.resolve(this.client.hideUserExplorer());
  }
  fetch() {
    return Promise.resolve(this.client.fetch());
  }
  onInitialized(config?: { timeout?: number }) {
    return this.client.onInitialized(config);
  }
  getDisplayedInAppMessage(): Promise<HackleInAppMessageView | null> {
    return Promise.resolve(this.client.getDisplayedInAppMessageView());
  }
}

export default HackleManager;
