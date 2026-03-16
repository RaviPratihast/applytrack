import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

function KanbanCard({ application, onEdit, onDelete, onView, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-[10px] border border-app-border p-3 select-none ${isDragging ? "shadow-lg rotate-1" : "hover:shadow-sm"} transition-shadow`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {application.company}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {application.role}
          </p>
          {application.appliedDate && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              {new Date(application.appliedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-1 mt-2">
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

export default KanbanCard;
