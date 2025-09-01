"use client";

import useVariation from "../hooks/useVariation";

interface VariationTesterProps {}

export default function VariationTester({}: VariationTesterProps) {
  const { variation, isLoading } = useVariation(40, "A", {
    suspense: true,
  });

  return (
    <pre style={{ fontSize: 24, height: 50, backgroundColor: "#ff5500" }}>
      {variation}
    </pre>
  );
}
