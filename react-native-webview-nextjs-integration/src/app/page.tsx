"use client";

import styles from "./page.module.css";
import { Suspense } from "react";
import Loader from "./components/Loader";
import VariationTester from "./components/VariationTester";
import FeatureTester from "./components/FeatureTester";
import UserController from "./components/UserController";
import CustomTracker from "./components/CustomTracker";
import RemoteConfig from "./components/RemoteConfig";
import hackleClient from "./modules/client";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <UserController />
          <CustomTracker />
          <button
            onClick={() => {
              hackleClient.showUserExplorer();
            }}>
            Show UserExplorer
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
          }}>
          <div>
            <h2>
              Experiment <br /> [key: 40]
            </h2>
            <Suspense fallback={<Loader />}>
              <VariationTester />
            </Suspense>
          </div>
          <div>
            <h2>
              Feature Flag <br /> [key: 22]
            </h2>
            <Suspense fallback={<Loader />}>
              <FeatureTester />
            </Suspense>
          </div>
          <div>
            <h2>
              Remote Config <br /> [key: 'targeting_rule_test']
            </h2>
            <Suspense fallback={<Loader />}>
              <RemoteConfig />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
