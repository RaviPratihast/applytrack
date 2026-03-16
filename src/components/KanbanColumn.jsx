import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "@/components/KanbanCard";
import { APPLICATION_STATUS } from "@/types/application";

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

function KanbanColumn({ id, label, applications, onEdit, onDelete, onView }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const style = COLUMN_STYLES[id] ?? {
    header: "text-foreground",
    bg: "bg-muted/30",
    border: "border-border",
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 ${style.border} ${style.bg} ${isOver ? "ring-2 ring-[#DDF159]" : ""} p-3 min-h-[200px] transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-sm font-semibold uppercase tracking-wide ${style.header}`}
        >
          {label}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default KanbanColumn;
