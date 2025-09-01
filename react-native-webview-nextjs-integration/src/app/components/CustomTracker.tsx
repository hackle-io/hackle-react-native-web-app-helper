import hackleClient from "../modules/client";

export default function CustomTracker() {
  return (
    <button
      onClick={() =>
        hackleClient.track({
          key: "click_button",
          properties: {
            button_name: "custom",
          },
        })
      }>
      Track Custom Event
    </button>
  );
}
