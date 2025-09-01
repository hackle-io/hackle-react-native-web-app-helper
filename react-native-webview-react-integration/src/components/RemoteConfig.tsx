import useRemoteConfig from "../hooks/useRemoteConfig";

export default function RemoteConfig() {
  const { config } = useRemoteConfig("targeting_rule_test", "String 입니다");

  return (
    <pre style={{ fontSize: 23, height: 150, backgroundColor: "#75be6b" }}>
      {config}
    </pre>
  );
}
