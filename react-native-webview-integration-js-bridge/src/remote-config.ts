export interface WebViewConfig {
  get(key: string, defaultValue: string): Promise<string>;
  get(key: string, defaultValue: number): Promise<number>;
  get(key: string, defaultValue: boolean): Promise<boolean>;
}

export default class WebViewRemoteConfig implements WebViewConfig {
  constructor(
    private readonly configFetcher: (
      key: string,
      defaultValue: string | number | boolean
    ) => Promise<{ configValue: string | number | boolean }>
  ) {
    this.configFetcher = configFetcher;
  }

  async get(key: string, defaultValue: string): Promise<string>;
  async get(key: string, defaultValue: number): Promise<number>;
  async get(key: string, defaultValue: boolean): Promise<boolean>;
  async get(
    key: string,
    defaultValue: string | number | boolean
  ): Promise<string | number | boolean> {
    try {
      const result = await this.configFetcher(key, defaultValue);
      if (!result) {
        throw new Error("invoke result data not exists");
      }

      const { configValue } = result;

      switch (typeof defaultValue) {
        case "number":
          return Number(configValue);
        case "boolean":
          return Boolean(configValue);
        default:
          return configValue;
      }
    } catch (e) {
      console.error(
        `Unexpected exception while deciding remote config parameter[${key}]. Returning default value. : ${e}`
      );
      return defaultValue;
    }
  }
}
