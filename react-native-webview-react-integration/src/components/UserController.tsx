"use client";
import { useState } from "react";
import hackleClient from "../modules/client";

export default function UserController() {
  const [userId, setUserId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  return (
    <>
      <button type="button" onClick={() => hackleClient.resetUser()}>
        ResetUser
      </button>
      <div>
        <input
          type="text"
          placeholder="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={() => hackleClient.setUserId(userId)}>
          setUserId
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="deviceId"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />
        <button onClick={() => hackleClient.setDeviceId(deviceId)}>
          setDeviceId
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          type="text"
          placeholder="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={() => {
            hackleClient.setUserProperty(key, value);
            setKey("");
            setValue("");
          }}>
          setUserProperty
        </button>
      </div>
    </>
  );
}
