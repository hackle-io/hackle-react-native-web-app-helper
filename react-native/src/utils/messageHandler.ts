import { HACKLE_CONSTANTS } from '../constants';
import { HackleRequest } from '../types';

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
