import {HackleWebViewConfig} from "./HackleWebViewConfig";

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
