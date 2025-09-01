"use client";

import HackleProvider from "../context";
import hackleClient from "../modules/client";

export default function HackleWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HackleProvider hackleClient={hackleClient} supportSSR>
      {children}
    </HackleProvider>
  );
}
