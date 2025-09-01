import useRemoteConfig from "../hooks/useRemoteConfig";

export default function RemoteConfig() {
  const { config } = useRemoteConfig(
    "targeting_rule_test",
    "String 타입의 기본 값",
    {
      suspense: true,
    }
  );

  return (
    <pre
      style={{
        width: "100%",
        fontSize: 24,
        height: 50,
        backgroundColor: "#75be6b",
      }}>
      {config}
    </pre>
  );
}
