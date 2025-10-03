export type PostHogEventPayload = {
  api_key: string;
  event: string;
  distinct_id: string;
  properties: Record<string, any>;
  timestamp?: Date;
};

export async function sendPostHogEvent(payload: PostHogEventPayload) {
  //event endpoint
  const url = "https://us.i.posthog.com/i/v0/e/";
  const headers = {
    "Content-Type": "application/json",
  };

  console.info("\n\n\n\nsendPostHogEvent Payload", payload);

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });
}
