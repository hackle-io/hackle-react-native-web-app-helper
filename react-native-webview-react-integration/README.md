# react-native-webview-react-integration

ReactNative WebView를 통해 자사 웹사이트를 랜더링하는 경우, JavaScript SDK와의 릴레이 연동을 위해 사용합니다.

자세한 가이드는 [링크](https://docs-kr.hackle.io/docs/react-native-web-app-integration)를 참고하세요.

## Components

### useAsyncClient

React hooks에서 ReactNative <-> JavaScript SDK가 비동기로 메시지를 주고 받는 동안 발생하는 대기 시간을 Promise로 처리할 수 있게끔 돕습니다.

`isLoading` boolean 필드를 제공하고, 옵셔널하게 Promise를 throw 하기도 합니다.

### HackleProvider

`setUser`, `updateUserProperties` 등 유저 정보의 변경이 일어나는 메서드 호출이 발생했을 때 리렌더링을 트리거하기 위한 Provider 입니다.

유저 정보가 변경됨에 따라 새롭게 실험의 분배를 요청할 필요가 있기 때문입니다.

### useVariation

```typescript
function useVariation(
  experimentKey: number,
  defaultValue: string,
  options?: {
    suspense: boolean;
  }
): { variation: string; isLoading: boolean };
```

A/B 테스트를 사용하기 위한 hook 입니다.
실험 키와 기본 값을 할당하면, 실험의 분배가 이루어집니다.

### useFeature

```typescript
function useFeature(
  featureKey: number,
  defaultValue: boolean,
  options?: {
    suspense: boolean;
  }
): { isOn: boolean; isLoading: boolean };
```

기능 플래그를 사용하기 위한 hook 입니다.
기능 키와 기본 값을 할당하면, 기능 플래그의 값을 받아올 수 있습니다.

## Usage

### with `Suspense`

ReactNative와의 메시지 통신 간 Suspense에서 로딩 처리를 위임할 수 있습니다.

```jsx
<Suspense fallback={<LoadingIndicator />}>
  <VariationTester />
</Suspense>
```

### `isLoading` field

`isLoading` 필드를 사용해서 명시적인 로딩 처리를 할 수 있습니다.

```jsx
function VariationTester() {
  const { variation, isLoading } = useVariation(24, "A");

  if (isLoading) return <LoadingIndicator />;
  return <VariationRenderer variation={variation} />;
}
```

## Type Declaration

타입스크립트를 사용하고자 하는 경우 `react-native-webview-integration-js-bridge` 의 `d.ts` 를 사용할 수 있습니다.

`"hackle-js-bridge": "file:../react-native-webview-integration-js-bridge"`와 같은 형태로 연동한다면, 타입 정의가 적용됩니다.
