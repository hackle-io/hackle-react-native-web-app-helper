import {HackleWebViewConfigBuilder} from "./HackleWebViewConfigBuilder";

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

