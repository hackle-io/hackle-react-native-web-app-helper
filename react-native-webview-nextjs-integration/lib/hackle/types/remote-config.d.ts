export interface WebViewConfig {
    get(key: string, defaultValue: string): Promise<string>;
    get(key: string, defaultValue: number): Promise<number>;
    get(key: string, defaultValue: boolean): Promise<boolean>;
}
export default class WebViewRemoteConfig implements WebViewConfig {
    private readonly configFetcher;
    constructor(configFetcher: (key: string, defaultValue: string | number | boolean) => Promise<{
        configValue: string | number | boolean;
    }>);
    get(key: string, defaultValue: string): Promise<string>;
    get(key: string, defaultValue: number): Promise<number>;
    get(key: string, defaultValue: boolean): Promise<boolean>;
}
