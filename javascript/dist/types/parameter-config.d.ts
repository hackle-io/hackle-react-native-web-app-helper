export default class WebViewParameterConfig {
    readonly parameters: Record<string, any>;
    constructor(parameters: Record<string, any>);
    get(key: string, defaultValue: string | number | boolean | null): any;
}
