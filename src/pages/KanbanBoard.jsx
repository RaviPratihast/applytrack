import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import KanbanColumn from "@/components/KanbanColumn";
import KanbanCard from "@/components/KanbanCard";
import { APPLICATION_STATUS } from "@/types/application";

const COLUMNS = [
  { id: APPLICATION_STATUS.APPLIED,   label: "Applied" },
  { id: APPLICATION_STATUS.INTERVIEW, label: "Interview" },
  { id: APPLICATION_STATUS.OFFER,     label: "Offer" },
  { id: APPLICATION_STATUS.REJECTED,  label: "Rejected" },
];

function KanbanBoard({ applications, onUpdateApplication, onDeleteApplication, onEditApplication, onViewApplication }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeApp = activeId ? applications.find(a => a.id === activeId) : null;

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const overId = over.id;
    const columnIds = COLUMNS.map(c => c.id);
    const targetStatus = columnIds.includes(overId) ? overId : applications.find(a => a.id === overId)?.status;
    if (!targetStatus) return;
    const app = applications.find(a => a.id === active.id);
    if (app && app.status !== targetStatus) {
      onUpdateApplication({ ...app, status: targetStatus });
    }
  }

  return (
    <main className="px-5 py-5 w-full flex-1 overflow-x-auto flex flex-col gap-3">
      <div className="mx-auto max-w-[1400px] w-full flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">Drag cards between columns to update status</p>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start flex-1">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                applications={applications.filter(a => a.status === col.id)}
                onEdit={onEditApplication}
                onDelete={onDeleteApplication}
                onView={onViewApplication}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApp ? <KanbanCard application={activeApp} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  );
}

export default KanbanBoard;
