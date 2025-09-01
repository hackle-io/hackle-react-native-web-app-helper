import {
  HackleSubscriptionOperationsBuilder,
  PropertyOperations,
} from '@hackler/react-native-sdk';

const hackleInjectedJavaScript = 'window._hackle_injected = true';
const hackleMessagePrefix = '_hackle_message';

const isHackleMessageEvent = (event) => {
    try {
        const parsed = JSON.parse(event.nativeEvent.data);
        return hackleMessagePrefix in parsed;
    } catch (e) {
        return false;
    }
};

export default function useHackleWebviewManager({ postMessage, hackleClient }) {
    const sendMessage = (id, type, payload = null) => {
        postMessage?.(
            JSON.stringify({
                [hackleMessagePrefix]: {
                    id,
                    type,
                    payload,
                },
            })
        );
    };

    const onHackleMessage = (data) => {
        try {
            const parsed = JSON.parse(data);
            const { id, type, payload } = parsed[hackleMessagePrefix];
            switch (type) {
                case 'getSessionId':
                    return getSessionId(id, type);
                case 'getUser':
                    return getUser(id, type);
                case 'setUser':
                    return setUser(payload, id, type);
                case 'setUserId':
                    return setUserId(payload, id, type);
                case 'setDeviceId':
                    return setDeviceId(payload, id, type);
                case 'setUserProperty':
                    return setUserProperty(payload, id, type);
                case 'setUserProperties':
                    return setUserProperties(payload, id, type);
                case 'updateUserProperties':
                    return updateUserProperties(payload, id, type);
                case 'updatePushSubscriptions':
                    return updatePushSubscriptions(payload, id, type);
                case 'updateSmsSubscriptions':
                    return updateSmsSubscriptions(payload, id, type);
                case 'updateKakaoSubscriptions':
                    return updateKakaoSubscriptions(payload, id, type);
                case 'resetUser':
                    return resetUser(id, type);
                case 'variation':
                    return variation(payload, id, type);
                case 'variationDetail':
                    return variationDetail(payload, id, type);
                case 'isFeatureOn':
                    return isFeatureOn(payload, id, type);
                case 'featureFlagDetail':
                    return featureFlagDetail(payload, id, type);
                case 'remoteConfig':
                    return remoteConfig(payload, id, type);
                case 'showUserExplorer':
                    return showUserExplorer(id, type);
                case 'hideUserExplorer':
                    return hideUserExplorer(id, type);
                case 'fetch':
                    return fetch(id, type);
                case 'track':
                    return track(payload, id, type);
                default:
                    console.log('unknown type: ', type);
                    return sendMessage(null, 'error', 'unknown');
            }
        } catch (e) {
            sendMessage(null, 'error', JSON.stringify(e));
        }
    };

    const getSessionId = async (id, type) => {
        const user = await hackleClient.getUser();
        sendMessage(id, type, {
            sessionId: user.identifiers.sessionId,
        });
    };

    const getUser = async (id, type) => {
        const user = await hackleClient.getUser();
        sendMessage(id, type, {
            user,
        });
    };

    const setUser = async (payload, id, type) => {
        await hackleClient.setUser(payload.user);
        sendMessage(id, type);
    };

    const setUserId = async (payload, id, type) => {
        await hackleClient.setUserId(payload.userId);
        sendMessage(id, type);
    };

    const setDeviceId = async (payload, id, type) => {
        await hackleClient.setDeviceId(payload.deviceId);
        sendMessage(id, type);
    };

    const setUserProperty = async (payload, id, type) => {
        await hackleClient.setUserProperty(payload.key, payload.value);
        sendMessage(id, type);
    };

    const setUserProperties = async (payload, id, type) => {
        await hackleClient.setUserProperties(payload.properties);
        sendMessage(id, type);
    };

    const updateUserProperties = async (payload, id, type) => {
        const operations = Object.entries(payload.operations).reduce(
            (acc, [key, value]) => {
                acc.set(key, new Map(Object.entries(value)));
                return acc;
            },
            new Map()
        );

        await hackleClient.updateUserProperties(new PropertyOperations(operations));
        sendMessage(id, type);
    };

    const updatePushSubscriptions = async (payload, id, type) => {
      const subscriptions = Object.entries(payload.operations);
      let builder = new HackleSubscriptionOperationsBuilder();
      for (const [key, value] of subscriptions) {
        builder = builder.custom(key, value);
      }

      await hackleClient.updatePushSubscriptions(builder.build());
      sendMessage(id, type);
    };

    const updateSmsSubscriptions = async (payload, id, type) => {
      const subscriptions = Object.entries(payload.operations);
      let builder = new HackleSubscriptionOperationsBuilder();
      for (const [key, value] of subscriptions) {
        builder = builder.custom(key, value);
      }

      await hackleClient.updateSmsSubscriptions(builder.build());
      sendMessage(id, type);
    };

    const updateKakaoSubscriptions = async (payload, id, type) => {
      const subscriptions = Object.entries(payload.operations);
      let builder = new HackleSubscriptionOperationsBuilder();
      for (const [key, value] of subscriptions) {
        builder = builder.custom(key, value);
      }

      await hackleClient.updateKakaoSubscriptions(builder.build());
      sendMessage(id, type);
    };

    const resetUser = async (id, type) => {
        await hackleClient.resetUser();
        sendMessage(id, type);
    };

    const variation = async (payload, id, type) => {
        const result = await hackleClient.variation(payload.experimentKey);
        sendMessage(id, type, { variation: result });
    };

    const variationDetail = async (payload, id, type) => {
        const result = await hackleClient.variationDetail(payload.experimentKey);
        sendMessage(id, type, {
            variation: result.variation,
            parameters: result.parameters,
            reason: result.reason,
        });
    };

    const isFeatureOn = async (payload, id, type) => {
        const result = await hackleClient.isFeatureOn(payload.featureKey);
        sendMessage(id, type, {
            isOn: result,
        });
    };

    const featureFlagDetail = async (payload, id, type) => {
        const result = await hackleClient.featureFlagDetail(payload.featureKey);
        sendMessage(id, type, {
            isOn: result.isOn,
            parameters: result.parameters,
            reason: result.reason,
        });
    };

    const remoteConfig = async (payload, id, type) => {
        const rc = await hackleClient.remoteConfig();
        const result = await rc.get(payload.key, payload.defaultValue);
        sendMessage(id, type, {
            configValue: result,
        });
    };

    const showUserExplorer = async (id, type) => {
        await hackleClient.showUserExplorer();
        sendMessage(id, type);
    };

    const hideUserExplorer = async (id, type) => {
        await hackleClient.hideUserExplorer();
        sendMessage(id, type);
    };

    const fetch = async (id, type) => {
        await hackleClient.fetch();
        sendMessage(id, type);
    };

    const track = (payload, id, type) => {
        hackleClient.track(payload.event, payload.user);
        sendMessage(id, type);
    };

    return {
        hackleInjectedJavaScript,
        isHackleMessageEvent,
        onHackleMessage,
    };
}
