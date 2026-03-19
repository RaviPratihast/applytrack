/** Calls onChange when the page URL changes (SPA navigation, popstate, or polling). */
export function watchUrlChanges(onChange: () => void): void {
  let lastUrl = window.location.href;
  const check = (): void => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      onChange();
    }
  };
  window.addEventListener("popstate", onChange);
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  history.pushState = (...args) => { push(...args); lastUrl = window.location.href; onChange(); };
  history.replaceState = (...args) => { replace(...args); lastUrl = window.location.href; onChange(); };
  setInterval(check, 1000);
}
