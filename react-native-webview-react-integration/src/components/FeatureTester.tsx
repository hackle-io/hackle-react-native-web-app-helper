import useFeature from "../hooks/useFeature";

interface FeatureTesterProps {}

export default function FeatureTester({}: FeatureTesterProps) {
  const { isOn } = useFeature(22, false);

  return (
    <pre style={{ fontSize: 24, height: 50, backgroundColor: "#0065ff" }}>
      {isOn ? "On" : "Off"}
    </pre>
  );
}
