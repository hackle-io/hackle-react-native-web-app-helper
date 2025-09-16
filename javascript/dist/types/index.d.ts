import { Config } from "@hackler/javascript-sdk";
import { HackleClientBase } from "./base";
interface Port {
    postMessage(serialized: string): void;
}
declare global {
    interface Window {
        ReactNativeWebView: Port;
        _hackle_injected: boolean;
    }
}
/**
 * WebView 여부에 따라 다른 인스턴스를 반환하도록 하는 Wrapper
 * @example const hackleClient = new HackleManager().createInstance("SDK_KEY")
 */
declare class HackleManager {
    private injectFlag;
    private isInjectedEnvironment;
    createInstance(sdkKey: string, config: Config): HackleClientBase;
}
export default HackleManager;
