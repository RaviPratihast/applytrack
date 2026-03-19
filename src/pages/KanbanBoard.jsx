import { useMemo } from "react";
import { GripVertical } from "lucide-react";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/ui/kanban";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/types/application";
import { formatShortDate } from "@/lib/dates";

const COLUMN_ORDER = [
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFER,
  APPLICATION_STATUS.REJECTED,
];

const COLUMN_LABELS = {
  [APPLICATION_STATUS.APPLIED]: "Applied",
  [APPLICATION_STATUS.INTERVIEW]: "Interview",
  [APPLICATION_STATUS.OFFER]: "Offer",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
};

const COLUMN_STYLES = {
  [APPLICATION_STATUS.APPLIED]: {
    header: "text-blue-600",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
  },
  [APPLICATION_STATUS.INTERVIEW]: {
    header: "text-yellow-600",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
  },
  [APPLICATION_STATUS.OFFER]: {
    header: "text-green-600",
    bg: "bg-green-500/5",
    border: "border-green-500/20",
  },
  [APPLICATION_STATUS.REJECTED]: {
    header: "text-red-600",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
  },
};

function ApplicationCard({ application, onEdit, onView }) {
  return (
    <div className="flex flex-1 min-w-0 flex-col gap-2">
      <p className="text-sm font-semibold truncate">{application.company}</p>
      <p className="text-xs text-muted-foreground truncate">{application.role}</p>
      {application.appliedDate && (
        <p className="text-xs text-muted-foreground/60">
          {formatShortDate(application.appliedDate)}
        </p>
      )}
      <div className="flex justify-end gap-1 mt-1">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs rounded-[10px]"
            onClick={() => onView(application)}
          >
            View
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs rounded-[10px]"
          onClick={() => onEdit(application)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

function KanbanBoardPage({
  applications,
  onUpdateApplication,
  onEditApplication,
  onViewApplication,
}) {
  const columns = useMemo(() => {
    const cols = {};
    for (const status of COLUMN_ORDER) {
      cols[status] = applications.filter((a) => a.status === status);
    }
    return cols;
  }, [applications]);

  function handleValueChange(newColumns) {
    for (const [status, items] of Object.entries(newColumns)) {
      for (const app of items) {
        if (app.status !== status) {
          onUpdateApplication({ ...app, status });
        }
      }
    }
  }

  return (
    <main className="pt-3 px-5 pb-5 w-full flex-1 overflow-x-auto flex flex-col gap-3">
      <div className="mx-auto max-w-[1400px] w-full flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns to update status
          </p>
        </div>
        <Kanban
          value={columns}
          onValueChange={handleValueChange}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start flex-1">
            {COLUMN_ORDER.map((columnId) => {
              const style = COLUMN_STYLES[columnId] ?? {
                header: "text-foreground",
                bg: "bg-muted/30",
                border: "border-border",
              };
              const items = columns[columnId] ?? [];
              return (
                <KanbanColumn
                  key={columnId}
                  value={columnId}
                  className={`rounded-card border-2 ${style.border} ${style.bg} p-4 min-h-[200px] flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold uppercase tracking-wide ${style.header}`}
                      >
                        {COLUMN_LABELS[columnId]}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-[10px]">
                        {items.length}
                      </span>
                    </div>
                    <KanbanColumnHandle asChild>
                      <button
                        type="button"
                        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-1 rounded"
                        aria-label="Drag to reorder column"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </KanbanColumnHandle>
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-auto">
                    {items.map((app) => (
                      <KanbanItem key={app.id} value={app.id} asChild>
                        <div className="bg-white rounded-[10px] border border-app-border p-3 select-none hover:shadow-sm transition-shadow flex items-start gap-2">
                          <KanbanItemHandle asChild>
                            <button
                              type="button"
                              className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
                              aria-label="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>
                          </KanbanItemHandle>
                          <ApplicationCard
                            application={app}
                            onEdit={onEditApplication}
                            onView={onViewApplication}
                          />
                        </div>
                      </KanbanItem>
                    ))}
                  </div>
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === "column") return null;
              const app = Object.values(columns)
                .flat()
                .find((a) => a.id === value);
              if (!app) return null;
              return (
                <div className="bg-white rounded-[10px] border border-app-border p-3 shadow-lg flex items-start gap-2 w-[280px]">
                  <div className="mt-0.5 text-muted-foreground shrink-0">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <ApplicationCard
                    application={app}
                    onEdit={onEditApplication}
                    onView={onViewApplication}
                  />
                </div>
              );
            }}
          </KanbanOverlay>
        </Kanban>
      </div>
    </main>
  );
}

export default KanbanBoardPage;
