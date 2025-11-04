export class HackleMessage {
  static MESSAGE_FIELD_NAME = "_hackle_message";

  constructor(
    readonly id: string,
    readonly type: string,
    readonly payload: any,
    readonly browserProperties?: Record<string, string>
  ) {}

  static parseOrNull(data: any): HackleMessage | null {
    try {
      if (HackleMessage.MESSAGE_FIELD_NAME in data) {
        const { id, type, payload, browserProperties } =
          data[HackleMessage.MESSAGE_FIELD_NAME];
        return new HackleMessage(id, type, payload, browserProperties);
      }

      return null;
    } catch {
      return null;
    }
  }

  static from(
    id: string,
    type: string,
    payload: any,
    browserProperties: Record<string, string>
  ) {
    return new HackleMessage(id, type, payload, browserProperties);
  }

  toDto() {
    return {
      [HackleMessage.MESSAGE_FIELD_NAME]: {
        id: this.id,
        type: this.type,
        payload: this.payload,
        browserProperties: this.browserProperties,
      },
    };
  }
}
