export default class WebViewParameterConfig {
  constructor(readonly parameters: Record<string, any>) {
    this.parameters = parameters;
  }

  get(key: string, defaultValue: string | number | boolean | null) {
    const parameterValue = this.parameters[key];

    if (parameterValue === null || parameterValue === undefined) {
      return defaultValue;
    }

    if (defaultValue === null || defaultValue === undefined) {
      return parameterValue;
    }

    if (typeof parameterValue === typeof defaultValue) {
      return parameterValue;
    }

    return defaultValue;
  }
}
