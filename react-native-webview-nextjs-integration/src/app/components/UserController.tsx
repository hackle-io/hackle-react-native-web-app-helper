"use client";
import hackleClient from "../modules/client";

export default function UserController() {
  return (
    <>
      <button type="button" onClick={() => hackleClient.resetUser()}>
        ResetUser
      </button>
      <button type="button" onClick={() => hackleClient.setUserId("rich")}>
        setUserId
      </button>
      <button
        type="button"
        onClick={() => hackleClient.setDeviceId("deviceId-1234")}>
        setDeviceId
      </button>
    </>
  );
}
