import type { UniqueIdentifier, DragEndEvent, DndContextProps } from "@dnd-kit/core";
import type { SortableContextProps } from "@dnd-kit/sortable";

export type KanbanOnMoveEvent = DragEndEvent & {
  activeIndex: number;
  overIndex: number;
};

export type KanbanProps<T = unknown> = Omit<DndContextProps, "collisionDetection"> &
  (T extends object
    ? { getItemValue: (item: T) => UniqueIdentifier }
    : { getItemValue?: (item: T) => UniqueIdentifier }) & {
  value: Record<UniqueIdentifier, T[]>;
  onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
  onMove?: (event: KanbanOnMoveEvent) => void;
  strategy?: SortableContextProps["strategy"];
  orientation?: "horizontal" | "vertical";
  flatCursor?: boolean;
};
