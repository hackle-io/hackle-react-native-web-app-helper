/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { HackleProvider, createInstance } from "@hackler/react-native-sdk";
import React, { useRef } from "react";
import { SafeAreaView, StyleSheet, View, useColorScheme } from "react-native";
import WebView from "react-native-webview";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { useHackleWebviewManager } from "@hackler/hackle-react-native-webview-bridge";

const hackleClient = createInstance("SDK_KEY");

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});

function App() {
  const isDarkMode = useColorScheme() === "dark";

  const webviewRef = useRef(null);
  const { hackleInjectedJavaScript, onHackleMessage, isHackleMessageEvent } =
    useHackleWebviewManager({
      postMessage: (message) => webviewRef.current?.postMessage(message),
      hackleClient,
    });

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <HackleProvider hackleClient={hackleClient}>
      <SafeAreaView style={backgroundStyle}>
        <View style={styles.container}>
          <WebView
            ref={webviewRef}
            source={{ uri: "web_url" }}
            injectedJavaScriptBeforeContentLoaded={hackleInjectedJavaScript}
            onMessage={(e) => {
              if (isHackleMessageEvent(e)) {
                onHackleMessage(e.nativeEvent.data);
                return;
              }
            }}
          />
        </View>
      </SafeAreaView>
    </HackleProvider>
  );
}

export default App;
