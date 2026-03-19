import { saveApplication } from "./api.js";
import { toApplicationPayload } from "./api.js";
import type { ScrapedJob } from "./types.js";
import { DEFAULT_API_BASE_URL, STORAGE_KEY_API_BASE_URL } from "./constants.js";

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string; payload?: ScrapedJob },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (r: unknown) => void,
  ) => {
    const payload = msg.type === "SAVE_TO_APPLYTRACK" ? msg.payload : undefined;
    if (!payload) {
      sendResponse({ ok: false, error: "Missing payload" });
      return true;
    }
    (async () => {
      const { [STORAGE_KEY_API_BASE_URL]: baseUrl } =
        await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
      const apiBase =
        typeof baseUrl === "string" && baseUrl.trim()
          ? baseUrl.trim()
          : DEFAULT_API_BASE_URL;
      const applicationPayload = toApplicationPayload(payload);
      const result = await saveApplication(apiBase, applicationPayload);
      sendResponse(result);
    })();
    return true;
  },
);
