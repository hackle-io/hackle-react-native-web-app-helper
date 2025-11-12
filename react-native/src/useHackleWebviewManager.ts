/**
 * @hackler/hackle-react-native-webview-bridge
 * React Native WebView에서 Hackle을 사용하기 위한 통합 브릿지 패키지
 */

/**
 * Hackle 웹뷰 브릿지 관련 상수
 */
export const HACKLE_CONSTANTS = {
  /** Hackle 메시지 프리픽스 */
  MESSAGE_PREFIX: '_hackle_message',
  /** Hackle 호출 프리픽스 */
  INVOCATION_PREFIX: '_hackle',
} as const;

/**
 * Hackle 웹뷰 관리자 파라미터 타입
 */
export interface HackleWebviewManagerParams {
  /** 웹뷰에 메시지를 전송하는 함수 */
  postMessage: (message: string) => void;
  /** Hackle 클라이언트 인스턴스 */
  hackleClient: any;
}

/**
 * Hackle 요청 객체 타입
 */
export interface HackleRequest {
  /** 요청 ID */
  id: string;
  /** 요청 타입 */
  type: string;
  /** 요청 페이로드 */
  payload?: any;
  /** 브라우저 속성 */
  browserProperties?: Map<string, string>;
}

/**
 * Hackle 웹뷰 관리자 반환 타입
 */
export interface HackleWebviewManagerReturn {
  /** 웹뷰에 주입할 JavaScript 코드 */
  hackleInjectedJavaScript: string;
  /** Hackle 메시지 이벤트인지 확인하는 함수 */
  isHackleMessageEvent: (event: any) => boolean;
  /** Hackle 메시지를 처리하는 함수 */
  onHackleMessage: (data: string) => void;
}

/**
 * Hackle 웹뷰 설정을 생성하는 빌더 클래스
 */
export class HackleWebViewConfigBuilder {
    /** 자동 화면 추적 활성화 여부 */
    private isAutomaticScreenTracking = false;
    /** 자동 이벤트 추적 활성화 여부 */
    private isAutomaticEngagementTracking = false;

    /**
     * 자동 화면 추적 활성화 여부를 설정
     * @param value - 활성화 여부
     * @returns 현재 빌더 인스턴스
     */
    automaticScreenTracking(value: boolean): HackleWebViewConfigBuilder {
        this.isAutomaticScreenTracking = value;
        return this;
    }

    /**
     * 자동 이벤트 추적 활성화 여부를 설정
     * @param value - 활성화 여부
     * @returns 현재 빌더 인스턴스
     */
    automaticEngagementTracking(value: boolean): HackleWebViewConfigBuilder {
        this.isAutomaticEngagementTracking = value;
        return this;
    }

    /**
     * 웹뷰 설정 객체를 생성
     * @returns 설정된 값으로 생성된 웹뷰 설정 객체
     */
    build(): HackleWebViewConfig {
        return new HackleWebViewConfig(this.isAutomaticScreenTracking, this.isAutomaticEngagementTracking);
    }
}

/**
 * Hackle 웹뷰 설정 클래스
 */
export class HackleWebViewConfig {
  /** 자동 화면 추적 활성화 여부 */
  automaticScreenTracking: boolean;
  /** 자동 이벤트 추적 활성화 여부 */
  automaticEngagementTracking: boolean;

  /** 기본 설정값 */
  static readonly DEFAULT = new HackleWebViewConfigBuilder().build();

  constructor(automaticScreenTracking: boolean, automaticEngagementTracking: boolean) {
    this.automaticEngagementTracking = automaticEngagementTracking;
    this.automaticScreenTracking = automaticScreenTracking;
  }
}

/**
 * Hackle 메시지 이벤트인지 확인하는 함수
 * @param event - 웹뷰에서 받은 이벤트 객체
 * @returns Hackle 메시지 여부
 */
export const isHackleMessageEvent = (event: any): boolean => {
  try {
    const parsed = JSON.parse(event.nativeEvent.data);
    return HACKLE_CONSTANTS.MESSAGE_PREFIX in parsed;
  } catch (e) {
    return false;
  }
};

/**
 * 웹뷰에 응답 메시지를 전송하는 함수
 * @param postMessage - 메시지 전송 함수
 * @param response - JSON 문자열 응답
 */
export const sendResponseMessage = (
  postMessage: (message: string) => void,
  response: string
): void => {
  postMessage?.(response);
};

/**
 * Hackle 형식의 메시지를 생성하여 전송하는 함수
 * @param postMessage - 메시지 전송 함수
 * @param id - 메시지 ID
 * @param type - 메시지 타입
 * @param payload - 메시지 데이터
 */
export const sendMessage = (
  postMessage: (message: string) => void,
  id: string | null,
  type: string,
  payload: any = null
): void => {
  sendResponseMessage(
    postMessage,
    JSON.stringify({
      [HACKLE_CONSTANTS.MESSAGE_PREFIX]: {
        id,
        type,
        payload,
      },
    })
  );
};

/**
 * Hackle 명령 호출 객체를 생성하는 함수
 * @param request - Hackle 요청 객체
 * @returns JSON 문자열 형식의 명령 호출 객체
 */
export const resolveInvocation = (request: HackleRequest): string => {
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
export const resolveResponse = (request: HackleRequest, json: string): string => {
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
 * Hackle 브릿지를 호출하는 함수
 * @param request - Hackle 요청 객체
 * @param hackleClient - Hackle 클라이언트 인스턴스
 * @param postMessage - 메시지 전송 함수
 */
export const invokeBridge = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  const invocation = resolveInvocation(request);
  const json = await hackleClient.bridgeInvoke(invocation);
  const response = resolveResponse(request, json);
  sendResponseMessage(postMessage, response);
};

/**
 * Hackle 브릿지를 호출하는 함수 (데이터 매퍼 포함)
 * @param request - Hackle 요청 객체
 * @param hackleClient - Hackle 클라이언트 인스턴스
 * @param postMessage - 메시지 전송 함수
 * @param dataMapper - 성공 시 'result.data'를 'sendMessage' 페이로드로 변환하는 콜백 함수
 */
const invokeBridgeMapper = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void,
  dataMapper: (data: any) => Record<string, any>
): Promise<void> => {
  try {
    const invocation = resolveInvocation(request);
    const json = await hackleClient.bridgeInvoke(invocation);
    const result = JSON.parse(json);

    if (result.success === false) {
      return sendMessage(postMessage, request.id, request.type, result.message);
    }

    const payload = dataMapper(result.data);
    sendMessage(postMessage, request.id, request.type, payload);
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    sendMessage(postMessage, request.id, request.type, errorMessage);
  }
};

/**
 * getUser 커맨드 핸들러
 */
export const getUser = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    user: data,
  }));
};

/**
 * getSessionId 커맨드 핸들러
 */
export const getSessionId = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    sessionId: data,
  }));
};

/**
 * variation 커맨드 핸들러
 */
export const variation = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    variation: data,
  }));
};

/**
 * variationDetail 커맨드 핸들러
 */
export const variationDetail = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    variation: data.variation,
    parameters: data.config.parameters,
    reason: data.reason,
  }));
};

/**
 * isFeatureOn 커맨드 핸들러
 */
export const isFeatureOn = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    isOn: data,
  }));
};

/**
 * featureFlagDetail 커맨드 핸들러
 */
export const featureFlagDetail = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    isOn: data.isOn,
    parameters: data.config.parameters,
    reason: data.reason,
  }));
};

/**
 * remoteConfig 커맨드 핸들러
 */
export const remoteConfig = async (
  request: HackleRequest,
  hackleClient: any,
  postMessage: (message: string) => void
): Promise<void> => {
  await invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
    configValue: data,
  }));
};

/**
 * Hackle 웹뷰 관리 훅
 * @param params - 파라미터 객체
 * @param params.postMessage - 웹뷰에 메시지를 전송하는 함수
 * @param params.hackleClient - Hackle 클라이언트 인스턴스
 * @param hackleWebViewConfig - 웹뷰 설정
 * @returns Hackle 웹뷰 관리 유틸리티 함수들
 */
export default function useHackleWebviewManager(
  {
    postMessage,
    hackleClient,
  }: HackleWebviewManagerParams,
  hackleWebViewConfig: HackleWebViewConfig = HackleWebViewConfig.DEFAULT
): HackleWebviewManagerReturn {
  /**
   * Hackle 메시지를 처리하는 함수
   * @param data - 수신된 메시지 데이터
   */
  const onHackleMessage = (data: string): Promise<void> => {
    try {
      const request = JSON.parse(data)[HACKLE_CONSTANTS.MESSAGE_PREFIX];

      switch (request.type) {
        case 'getUser':
          return getUser(request, hackleClient, postMessage);
        case 'getSessionId':
          return getSessionId(request, hackleClient, postMessage);
        case 'variation':
          return variation(request, hackleClient, postMessage);
        case 'variationDetail':
          return variationDetail(request, hackleClient, postMessage);
        case 'isFeatureOn':
          return isFeatureOn(request, hackleClient, postMessage);
        case 'featureFlagDetail':
          return featureFlagDetail(request, hackleClient, postMessage);
        case 'remoteConfig':
          return remoteConfig(request, hackleClient, postMessage);
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

export { useHackleWebviewManager };
