/**
 * Hackle 웹뷰 브릿지 관련 상수
 */
export const HACKLE_CONSTANTS = {
  /** 웹뷰에 주입할 JavaScript 코드 */
  INJECTED_JAVASCRIPT: 'window._hackle_injected = true',
  /** Hackle 메시지 프리픽스 */
  MESSAGE_PREFIX: '_hackle_message',
  /** Hackle 호출 프리픽스 */
  INVOCATION_PREFIX: '_hackle',
} as const;
