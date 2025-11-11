import type {HackleRequest} from '../types';
import { invokeBridgeMapper } from './bridgeInvoker';

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
