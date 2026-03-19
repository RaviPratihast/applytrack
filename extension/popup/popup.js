const STORAGE_KEY_API_BASE_URL = "applytrack_api_base_url";
const STORAGE_KEY_DASHBOARD_URL = "applytrack_dashboard_url";
const DEFAULT_API_BASE_URL = "http://localhost:3001";
const DEFAULT_DASHBOARD_URL = "http://localhost:5173";

const apiUrlInput = document.getElementById("api-url");
const dashboardUrlInput = document.getElementById("dashboard-url");
const openDashboardBtn = document.getElementById("open-dashboard");
const saveSettingsBtn = document.getElementById("save-settings");

chrome.storage.local.get(
  [STORAGE_KEY_API_BASE_URL, STORAGE_KEY_DASHBOARD_URL],
  (result) => {
    apiUrlInput.value =
      result[STORAGE_KEY_API_BASE_URL] || DEFAULT_API_BASE_URL;
    dashboardUrlInput.value =
      result[STORAGE_KEY_DASHBOARD_URL] || DEFAULT_DASHBOARD_URL;
  },
);

saveSettingsBtn.addEventListener("click", () => {
  const apiUrl = apiUrlInput.value.trim() || DEFAULT_API_BASE_URL;
  const dashboardUrl = dashboardUrlInput.value.trim() || DEFAULT_DASHBOARD_URL;
  chrome.storage.local.set({
    [STORAGE_KEY_API_BASE_URL]: apiUrl,
    [STORAGE_KEY_DASHBOARD_URL]: dashboardUrl,
  });
  saveSettingsBtn.textContent = "Saved";
  setTimeout(() => {
    saveSettingsBtn.textContent = "Save";
  }, 1500);
});

openDashboardBtn.addEventListener("click", () => {
  const url = dashboardUrlInput.value.trim() || DEFAULT_DASHBOARD_URL;
  chrome.tabs.create({ url });
});
