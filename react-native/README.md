# @hackler/hackle-react-native-webview-bridge

React Native WebView 에서 Hackle을 사용하기 위한 브릿지 패키지입니다.

## 지원 SDK 버전

- `@hackler/javascript-sdk` 11.48.0 이상
- `@hackler/react-native-sdk` 3.26.0 이상

## 설치

```bash
npm install git+https://github.com/hackle-io/hackle-react-native-web-app-helper.git#main:react-native
```

## 사용법

```jsx
import { useHackleWebviewManager } from "@hackler/hackle-react-native-webview-bridge";

const { hackleInjectedJavaScript, onHackleMessage, isHackleMessageEvent } =
  useHackleWebviewManager({
    postMessage: (message) => webviewRef.current?.postMessage(message),
    hackleClient,
  });
```

예제 코드는 [examples/App.jsx](./examples/App.jsx)를 참고하세요.
