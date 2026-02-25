function AppNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "applications", label: "Applications" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="app-nav border-b border-border bg-background" aria-label="Main">
      <div className="mx-auto max-w-screen-2xl w-full px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`
                shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default AppNav;
