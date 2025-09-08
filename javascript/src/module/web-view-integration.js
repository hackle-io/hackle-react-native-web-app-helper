import {
    createInstance,
    Decision,
    DecisionReason,
    FeatureFlagDecision,
} from '@hackler/javascript-sdk'
import {v4 as uuidv4} from "uuid";

function promiseWithTimeout(callback, {timeoutMillis = 5000, onTimeout}) {
    return new Promise((resolve, reject) => {
        callback(resolve, reject);

        setTimeout(() => {
            onTimeout(resolve, reject);
        }, timeoutMillis);
    });
}

/**
 * WebView 여부에 따라 다른 인스턴스를 반환하도록 하는 Wrapper
 * @example const hackleClient = new HackleManager().createInstance("SDK_KEY")
 */
class HackleManager {
    #injectFlag = "_hackle_injected";

    #isInjectedEnvironment() {
        if (typeof window === "undefined" || !window.ReactNativeWebView)
            return false;

        return window[this.#injectFlag] === true;
    }

    /**
     *
     * @param {string} sdkKey sdkKey - react-native-sdk's sdkKey will be used under injectedEnvironment.
     * @param {Config} config configuration
     */
    createInstance(sdkKey, config) {
        if (this.#isInjectedEnvironment()) {
            const messageTransceiver = new WebViewMessageTransceiver(
                window.ReactNativeWebView
            );

            return new HackleWebViewClient(sdkKey, config, messageTransceiver);
        }

        return new HackleWebOnlyClient(sdkKey, config);
    }
}

class WebViewMessageTransceiver {
    cleanUp;

    /**
     *
     * @param {{
     *   postMessage(msg: Serializable)  => void
     * }} port
     */
    constructor(port) {
        this.port = port;
    }

    addEventListener(_listener) {
        // to work in both Android and iOS, useCapture should be true
        window.addEventListener("message", _listener, true);
        this.cleanUp = () => window.removeEventListener(_listener, true);
    }
}

/**
 * ReactNative WebView 환경에서만 동작하는 HackleClient
 */
class HackleWebViewClient {
    #messageFieldName = "_hackle_message";
    #resolverRecord = new Map();

    /**
     *
     * @param {string} sdkKey
     * @param {Config} config
     * @param {WebViewMessageTransceiver} messageTransceiver
     */
    constructor(sdkKey, config, messageTransceiver) {
        this.sdkKey = sdkKey;
        this.config = config;
        this.messageTransceiver = messageTransceiver;
        this.messageTransceiver.addEventListener((e) => {
            if (!e.data || e.data === "undefined") return;

            try {
                const data = JSON.parse(e.data);
                if (this.#messageFieldName in data) {
                    const {id, payload} = data[this.#messageFieldName];

                    if (id) {
                        this.#resolverRecord.get(id)?.(payload);
                        this.#resolverRecord.delete(id);
                    }
                }
            } catch (err) {
                console.log(
                    `[DEBUG] Hackle: Failed to parse message. If message not sent by hackle, please ignore this. ${err}`
                );
            }
        });
    }

    #createMessage(id, type, payload) {
        return JSON.stringify({
            [this.#messageFieldName]: {
                id,
                type,
                payload,
            },
        });
    }

    #createId() {
        return uuidv4();
    }

    async getSessionId() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "getSessionId", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve("")}
        );
    }

    async getUser() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "getUser", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve({})}
        );
    }

    setUser(user) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setUser", {user})
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    setUserId(userId) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                let resolveUserId = userId;
                if (userId === undefined || userId === null) {
                    resolveUserId = null;
                }
                
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setUserId", {
                        'userId': resolveUserId,
                    })
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    setDeviceId(deviceId) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setDeviceId", {deviceId})
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    setUserProperty(key, value) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setUserProperty", {key, value})
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    setUserProperties(properties) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setUserProperties", {properties})
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    updateUserProperties(operations) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "updateUserProperties", {
                        operations: operations.toRecord(),
                    })
                );

                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    updatePushSubscriptions(operations) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "updatePushSubscriptions", {
                        operations: operations.toRecord(),
                    })
                );

                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    updateSmsSubscriptions(operations) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "updateSmsSubscriptions", {
                        operations: operations.toRecord(),
                    })
                );

                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    updateKakaoSubscriptions(operations) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "updateKakaoSubscriptions", {
                        operations: operations.toRecord(),
                    })
                );

                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    setPhoneNumber(phoneNumber) {
        const id = this.#createId();

        return promiseWithTimeout((resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "setPhoneNumber", {phoneNumber}))
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    unsetPhoneNumber() {
        const id = this.#createId();

        return promiseWithTimeout((resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "unsetPhoneNumber", null))
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    resetUser() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "resetUser", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }

    variation(experimentKey) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "variation", {
                        experimentKey,
                    })
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve("A")}
        );
    }

    async variationDetail(experimentKey) {
        const id = this.#createId();

        try {
            const payload = await promiseWithTimeout(
                (resolve) => {
                    this.messageTransceiver.port.postMessage(
                        this.#createMessage(id, "variationDetail", {
                            experimentKey,
                        })
                    );
                    this.#resolverRecord.set(id, resolve);
                },
                {
                    onTimeout: (resolve, reject) => reject(),
                }
            );

            const {variation, reason, parameters} = payload;

            return Decision.of(
                variation,
                reason,
                new WebViewParameterConfig(parameters ?? {})
            );
        } catch (err) {
            return Decision.of("A", DecisionReason.EXCEPTION);
        }
    }

    isFeatureOn(featureKey) {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "isFeatureOn", {
                        featureKey,
                    })
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve(false)}
        );
    }

    async featureFlagDetail(featureKey) {
        const id = this.#createId();

        try {
            const payload = await promiseWithTimeout(
                (resolve) => {
                    this.messageTransceiver.port.postMessage(
                        this.#createMessage(id, "featureFlagDetail", {
                            featureKey,
                        })
                    );
                    this.#resolverRecord.set(id, resolve);
                },
                {onTimeout: (resolve, reject) => reject()}
            );
            const {isOn, reason, parameters} = payload;

            return new FeatureFlagDecision(
                isOn,
                reason,
                new WebViewParameterConfig(parameters ?? {}),
                undefined
            );
        } catch (err) {
            return FeatureFlagDecision.off(DecisionReason.EXCEPTION);
        }
    }

    track(event, user) {
        const id = this.#createId();


        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "track", {event, user})
                );
                this.#resolverRecord.set(id, resolve);
            },
            {
                onTimeout: (resolve) => resolve(),
            }
        );
    }

    async trackPageView(option) {
        // not implemented
    }

    remoteConfig() {
        const remoteConfigGetter = (key, defaultValue, valueType) => {
            const id = this.#createId();

            return promiseWithTimeout(
                (resolve) => {
                    this.messageTransceiver.port.postMessage(
                        this.#createMessage(id, "remoteConfig", {
                            key,
                            defaultValue,
                            valueType
                        })
                    );
                    this.#resolverRecord.set(id, resolve);
                },
                {onTimeout: (resolve) => resolve(defaultValue)}
            );
        };

        return new WebViewRemoteConfig(remoteConfigGetter);
    }

    showUserExplorer() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "showUserExplorer", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {
                onTimeout: (resolve) => resolve(),
            }
        );
    }

    async hideUserExplorer() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "hideUserExplorer", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {
                onTimeout: (resolve) => resolve(),
            }
        );
    }

    fetch() {
        const id = this.#createId();

        return promiseWithTimeout(
            (resolve) => {
                this.messageTransceiver.port.postMessage(
                    this.#createMessage(id, "fetch", null)
                );
                this.#resolverRecord.set(id, resolve);
            },
            {onTimeout: (resolve) => resolve()}
        );
    }
}

/**
 * React Native WebView 환경이 아닌 경우 사용되는 hackleClient
 */
class HackleWebOnlyClient {
    client;

    constructor(sdkKey, config) {
        this.client = createInstance(sdkKey, config);
    }

    getSessionId() {
        return Promise.resolve(this.client.getSessionId());
    }

    getUser() {
        return Promise.resolve(this.client.getUser());
    }

    setUser(user) {
        return Promise.resolve(this.client.setUser(user));
    }

    setUserId(userId) {
        return Promise.resolve(this.client.setUserId(userId));
    }

    setDeviceId(deviceId) {
        return Promise.resolve(this.client.setDeviceId(deviceId));
    }

    setUserProperty(key, value) {
        return Promise.resolve(this.client.setUserProperty(key, value));
    }

    setUserProperties(properties) {
        return Promise.resolve(this.client.setUserProperties(properties));
    }

    updateUserProperties(operations) {
        return Promise.resolve(this.client.updateUserProperties(operations));
    }

    updatePushSubscriptions(operations) {
        return Promise.resolve(this.client.updatePushSubscriptions(operations));
    }

    updateSmsSubscriptions(operations) {
        return Promise.resolve(this.client.updateSmsSubscriptions(operations));
    }

    updateKakaoSubscriptions(operations) {
        return Promise.resolve(this.client.updateKakaoSubscriptions(operations));
    }

    setPhoneNumber(phoneNumber) {
        return Promise.resolve(this.client.setPhoneNumber(phoneNumber));
    }

    unsetPhoneNumber() {
        return Promise.resolve(this.client.unsetPhoneNumber());
    }

    resetUser() {
        return Promise.resolve(this.client.resetUser());
    }

    variation(experimentKey) {
        return Promise.resolve(this.client.variation(experimentKey));
    }

    variationDetail(experimentKey) {
        return Promise.resolve(this.client.variationDetail(experimentKey));
    }

    isFeatureOn(featureKey) {
        return Promise.resolve(this.client.isFeatureOn(featureKey));
    }

    featureFlagDetail(featureKey) {
        return Promise.resolve(this.client.featureFlagDetail(featureKey));
    }

    track(event) {
        return Promise.resolve(this.client.track(event));
    }

    trackPageView(option) {
        return Promise.resolve(this.client.trackPageView(option));
    }

    remoteConfig() {
        return this.client.remoteConfig();
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
}

class WebViewParameterConfig {
    constructor(parameters) {
        this.parameters = parameters;
    }

    get(key, defaultValue) {
        const parameterValue = this.parameters[key];

        if (parameterValue === null || parameterValue === undefined) {
            return defaultValue;
        }

        if (defaultValue === null || defaultValue === undefined) {
            return parameterValue;
        }

        if (typeof parameterValue === typeof defaultValue) {
            return parameterValue;
        }

        return defaultValue;
    }
}

class WebViewRemoteConfig {
    constructor(configFetcher) {
        this.configFetcher = configFetcher;
    }

    async get(key, defaultValue) {
        try {
            const valueType = typeof defaultValue;
            const result = await this.configFetcher(key, defaultValue, valueType);
            if (result === null || result === undefined) {
                throw new Error("invoke result data not exists");
            }

            switch (typeof defaultValue) {
                case "number":
                    return Number(result);
                case "boolean":
                    return Boolean(result);
                default:
                    return result;
            }
        } catch (e) {
            console.error(
                `Unexpected exception while deciding remote config parameter[${key}]. Returning default value. : ${e}`
            );
            return defaultValue;
        }
    }
}

export default HackleManager;
