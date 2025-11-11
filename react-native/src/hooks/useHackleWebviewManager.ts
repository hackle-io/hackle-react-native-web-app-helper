import type {HackleWebviewManagerParams, HackleWebviewManagerReturn} from '../types';
import { HACKLE_CONSTANTS } from '../constants';
import { isHackleMessageEvent, sendMessage, invokeBridge } from '../utils';
import * as commandHandlers from '../utils/commandHandlers';
import { HackleWebViewConfig } from '../models'

/**
 * Hackle 웹뷰 관리 훅
 * @param params - 파라미터 객체
 * @param params.postMessage - 웹뷰에 메시지를 전송하는 함수
 * @param params.hackleClient - Hackle 클라이언트 인스턴스
 * @param hackleWebViewConfig
 * @returns Hackle 웹뷰 관리 유틸리티 함수들
 */
export default function useHackleWebviewManager({
  postMessage,
  hackleClient,
}: HackleWebviewManagerParams, hackleWebViewConfig: HackleWebViewConfig = HackleWebViewConfig.DEFAULT): HackleWebviewManagerReturn {
  /**
   * Hackle 메시지를 처리하는 함수
   * @param data - 수신된 메시지 데이터
   */
  const onHackleMessage = (data: string): Promise<void> => {
    try {
      const request = JSON.parse(data)[HACKLE_CONSTANTS.MESSAGE_PREFIX];

      switch (request.type) {
        case 'getUser':
          return commandHandlers.getUser(request, hackleClient, postMessage);
        case 'getSessionId':
          return commandHandlers.getSessionId(request, hackleClient, postMessage);
        case 'variation':
          return commandHandlers.variation(request, hackleClient, postMessage);
        case 'variationDetail':
          return commandHandlers.variationDetail(request, hackleClient, postMessage);
        case 'isFeatureOn':
          return commandHandlers.isFeatureOn(request, hackleClient, postMessage);
        case 'featureFlagDetail':
          return commandHandlers.featureFlagDetail(request, hackleClient, postMessage);
        case 'remoteConfig':
          return commandHandlers.remoteConfig(request, hackleClient, postMessage);
        case 'setUser':
        case 'setUserId':
        case 'setDeviceId':
        case 'setUserProperty':
        case 'setUserProperties':
        case 'updateUserProperties':
        case 'updatePushSubscriptions':
        case 'updateSmsSubscriptions':
        case 'updateKakaoSubscriptions':
        case 'resetUser':
        case 'showUserExplorer':
        case 'hideUserExplorer':
        case 'fetch':
        case 'track':
          return invokeBridge(request, hackleClient, postMessage);
        default:
          sendMessage(postMessage, request.id, 'error', 'unknown type');
          return Promise.resolve();
      }
    } catch (e: any) {
      sendMessage(postMessage, null, 'error', e.message || 'JSON parsing failed');
      return Promise.resolve();
    }
  };

  /**
  * 웹뷰나 브라우저 컨텍스트에 주입될 JavaScript 코드를 생성하여 반환하는 함수
  * @returns {string} 웹뷰나 브라우저 컨텍스트에 주입될 JavaScript 코드 문자열
  */
  const hackleInjectedJavaScript = (): string => `
    window._hackle_injected = true;
    window._hackleApp = {
      getWebViewConfig: function() {
        return '${JSON.stringify(hackleWebViewConfig)}';
      }
    };
  `;


  return {
    hackleInjectedJavaScript: hackleInjectedJavaScript(),
    isHackleMessageEvent,
    onHackleMessage,
  };
}
