import { Suspense, useEffect, useState } from "react";
import VariationTester from "./components/VariationTester";
import HackleProvider from "./context";
import hackleClient from "./modules/client";
import Loader from "./components/Loader";
import FeatureTester from "./components/FeatureTester";
import RemoteConfig from "./components/RemoteConfig";
import CustomTracker from "./components/CustomTracker";
import UserController from "./components/UserController";
import { User } from "@hackler/javascript-sdk";

function App() {
  const [user, setUser] = useState<User>({});

  const refetch = () => {
    hackleClient.getUser().then((user) => {
      setUser(user);
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <main>
      <HackleProvider hackleClient={hackleClient}>
        <div>
          <h2>current User</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={refetch}>refetch</button>
        </div>
        <br />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <UserController />
          <CustomTracker />
          <button onClick={() => hackleClient.showUserExplorer()}>
            Show UserExplorer
          </button>
        </div>
        {/* A/B 테스트 */}
        <div>
          <h2>
            Experiment <br /> [key: 40]
          </h2>
          <VariationTester />
        </div>
        {/* 기능 플래그 */}
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
            Remote Config <br /> [key: targeting_rule_test]
          </h2>
          <Suspense fallback={<Loader />}>
            <RemoteConfig />
          </Suspense>
        </div>
      </HackleProvider>
    </main>
  );
}

export default App;
