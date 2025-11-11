import type {HackleRequest} from '../types';
import { resolveInvocation, resolveResponse, sendResponseMessage, sendMessage } from './messageHandler';

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
 * Hackle 브릿지를 호출하는 함수
 * @param request - Hackle 요청 객체
 * @param hackleClient - Hackle 클라이언트 인스턴스
 * @param postMessage - 메시지 전송 함수
 * @param dataMapper - 성공 시 'result.data'를 'sendMessage' 페이로드로 변환하는 콜백 함수
 */
const _invokeBridgeMapper = async (
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
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
    await _invokeBridgeMapper(request, hackleClient, postMessage, (data) => ({
        configValue: data,
    }));
};
