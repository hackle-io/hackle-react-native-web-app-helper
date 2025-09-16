interface HackleWebviewManagerParams {
  postMessage: (message: string) => void;
  hackleClient: any;
}

interface HackleRequest {
  id: string;
  type: string;
  payload?: any;
  browserProperties?: Map<string, string>;
}

interface HackleWebviewManagerReturn {
  hackleInjectedJavaScript: string;
  isHackleMessageEvent: (event: any) => boolean;
  onHackleMessage: (data: string) => void;
}

const HACKLE_CONSTANTS = {
  INJECTED_JAVASCRIPT: 'window._hackle_injected = true',
  MESSAGE_PREFIX: '_hackle_message',
  INVOCATION_PREFIX: '_hackle',
};

/**
 * Hackle 메시지 이벤트인지 확인하는 함수
 * @param event - 웹뷰에서 받은 이벤트 객체
 * @returns Hackle 메시지 여부
 */
const isHackleMessageEvent = (event: any): boolean => {
  try {
    const parsed = JSON.parse(event.nativeEvent.data);
    return HACKLE_CONSTANTS.MESSAGE_PREFIX in parsed;
  } catch (e) {
    return false;
  }
};

/**
 * Hackle 웹뷰 관리 훅
 * @param params - 파라미터 객체
 * @param params.postMessage - 웹뷰에 메시지를 전송하는 함수
 * @param params.hackleClient - Hackle 클라이언트 인스턴스
 * @returns Hackle 웹뷰 관리 유틸리티 함수들
 */
export default function useHackleWebviewManager({
  postMessage,
  hackleClient,
}: HackleWebviewManagerParams): HackleWebviewManagerReturn {
  /**
   * 웹뷰에 응답 메시지를 전송하는 함수
   * @param response - JSON 문자열 응답
   */
  const sendResponseMessage = (response: string): void => {
    postMessage?.(response);
  };

  /**
   * Hackle 형식의 메시지를 생성하여 전송하는 함수
   * @param id - 메시지 ID
   * @param type - 메시지 타입
   * @param payload - 메시지 데이터
   */
  const sendMessage = (
    id: string | null,
    type: string,
    payload: any = null,
  ): void => {
    sendResponseMessage(
      JSON.stringify({
        [HACKLE_CONSTANTS.MESSAGE_PREFIX]: {
          id,
          type,
          payload,
        },
      }),
    );
  };

  /**
   * Hackle 명령 호출 객체를 생성하는 함수
   * @param request - Hackle 요청 객체
   * @returns JSON 문자열 형식의 명령 호출 객체
   */
  const resolveInvocation = (request: HackleRequest): string => {
    return JSON.stringify({
      [HACKLE_CONSTANTS.INVOCATION_PREFIX]: {
        command: request.type,
        parameters: request.payload ?? null,
        browserProperties: request.browserProperties ?? null,
      },
    });
  };

  /**
   * Hackle 응답을 처리하는 함수
   * @param request - 호출 객체
   * @param json - JSON 문자열 응답
   * @returns 처리된 응답 메시지
   */
  const resolveResponse = (request: HackleRequest, json: string): string => {
    let type = request.type;
    let payload: any;

    try {
      const result = JSON.parse(json);

      if (result.success === false) {
        type = 'error';
        payload = result.message;
      } else {
        payload = result.data;
      }
    } catch (error: any) {
      type = 'error';
      payload = error.message || 'JSON parsing failed';
    }

    return JSON.stringify({
      [HACKLE_CONSTANTS.MESSAGE_PREFIX]: {
        id: request.id,
        type,
        payload,
      },
    });
  };


  /**
   * Hackle 메시지를 처리하는 함수
   * @param data - 수신된 메시지 데이터
   */
  const onHackleMessage = (data: string): Promise<void> => {
    try {
      const request = JSON.parse(data)[HACKLE_CONSTANTS.MESSAGE_PREFIX];
      switch (request.type) {
        case 'getUser':
          return getUser(request);
        case 'getSessionId':
          return getSessionId(request);
        case 'variation':
          return variation(request);
        case 'variationDetail':
          return variationDetail(request);
        case 'isFeatureOn':
          return isFeatureOn(request);
        case 'featureFlagDetail':
          return featureFlagDetail(request);
        case 'remoteConfig':
          return remoteConfig(request);
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
          return invokeBridge(request);
        default:
          sendMessage(request.id, 'error', 'unknown type');
          return Promise.resolve();

      }
    } catch (e: any) {
      sendMessage(null, 'error', e.message || 'JSON parsing failed');
      return Promise.resolve();
    }
  };

  /**
   * Hackle 브릿지를 호출하는 함수
   * @param request - Hackle 요청 객체
   */
  const invokeBridge = async (request: HackleRequest): Promise<void> => {
    const invocation = resolveInvocation(request);
    const json = await hackleClient.bridgeInvoke(invocation);
    const response = resolveResponse(request, json);
    sendResponseMessage(response);
  };

  /**
   * Hackle 브릿지를 호출하는 함수
   * @param request - Hackle 요청 객체
   * @param dataMapper - 성공 시 'result.data'를 'sendMessage' 페이로드로 변환하는 콜백 함수.
   */
  const invokeBridgeMapper = async (
      request: HackleRequest,
      dataMapper: (data: any) => Record<string, any>
  ): Promise<void> => {
    try {
      const invocation = resolveInvocation(request);
      const json = await hackleClient.bridgeInvoke(invocation);
      const result = JSON.parse(json);

      if (result.success === false) {
        return sendMessage(request.id, request.type, result.message);
      }

      const payload = dataMapper(result.data);
      sendMessage(request.id, request.type, payload);

    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      sendMessage(request.id, request.type, errorMessage);
    }
  };

  const getUser = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      user: data,
    }));
  };

  const getSessionId = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      sessionId: data,
    }));
  };

  const variation = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      variation: data,
    }));
  };

  const variationDetail = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      variation: data.variation,
      parameters: data.config.parameters,
      reason: data.reason,
    }));
  };

  const isFeatureOn = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      isOn: data
    }));
  }

  const featureFlagDetail = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      isOn: data.isOn,
      parameters: data.config.parameters,
      reason: data.reason,
    }));
  };

  const remoteConfig = async (request: HackleRequest): Promise<void> => {
    await invokeBridgeMapper(request, (data) => ({
      configValue: data
    }));
  };

  return {
    hackleInjectedJavaScript: HACKLE_CONSTANTS.INJECTED_JAVASCRIPT,
    isHackleMessageEvent,
    onHackleMessage,
  };
}
