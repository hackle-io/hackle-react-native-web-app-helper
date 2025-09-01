import useVariation from "../hooks/useVariation";
import Loader from "./Loader";

interface VariationTesterProps {}

export default function VariationTester({}: VariationTesterProps) {
  const { variation, isLoading } = useVariation(40, "A");

  if (isLoading) return <Loader />;

  return (
    <pre style={{ fontSize: 24, height: 50, backgroundColor: "#ff5500" }}>
      {variation}
    </pre>
  );
}
