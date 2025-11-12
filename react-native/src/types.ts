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
