import type { Announcements, DndContextProps, UniqueIdentifier } from '@dnd-kit/core'

/**
 * What a screen reader hears while a Sortable or Kanban item is dragged with the keyboard. dnd-kit's
 * own text is English and names things by id ("Draggable item 7 was moved over droppable area 3");
 * these name the item by its own label instead.
 */
export interface DragLabels {
  /** Read when a handle takes focus. Defaults to a sentence on picking up, moving, dropping, and cancelling. */
  instructions: string
  /** Read when an item is picked up. Defaults to `Picked up <name>.` */
  pickedUp: (name: string) => string
  /** Read when the dragged item passes over another. Defaults to `<name> moved over <over>.` */
  movedOver: (name: string, over: string) => string
  /** Read when the item is dropped; `over` is empty when it landed on nothing. Defaults to `<name> dropped over <over>.` */
  dropped: (name: string, over: string | undefined) => string
  /** Read when the drag is cancelled. Defaults to `Dragging cancelled. <name> returned to its place.` */
  cancelled: (name: string) => string
}

export const defaultDragLabels: DragLabels = {
  instructions:
    'To pick up an item, press space or enter. While dragging, use the arrow keys to move it. Press space or enter again to drop it, or escape to cancel.',
  pickedUp: (name) => `Picked up ${name}.`,
  movedOver: (name, over) => `${name} moved over ${over}.`,
  dropped: (name, over) => (over ? `${name} dropped over ${over}.` : `${name} was dropped.`),
  cancelled: (name) => `Dragging cancelled. ${name} returned to its place.`
}

/**
 * The `accessibility` prop of a `DndContext`, spoken from `labels` and the name `nameOf` finds for
 * an id. A prop the caller passes wins over these.
 */
export function dragAccessibility(
  labels: DragLabels,
  nameOf: (id: UniqueIdentifier) => string,
  override: DndContextProps['accessibility']
): DndContextProps['accessibility'] {
  const announcements: Announcements = {
    onDragStart: ({ active }) => labels.pickedUp(nameOf(active.id)),
    // dnd-kit reports the item over itself right after pick-up; announcing that would replace
    // "Picked up …" with "… moved over …" (itself) before it is read.
    onDragOver: ({ active, over }) =>
      over && over.id !== active.id
        ? labels.movedOver(nameOf(active.id), nameOf(over.id))
        : undefined,
    onDragEnd: ({ active, over }) =>
      labels.dropped(nameOf(active.id), over ? nameOf(over.id) : undefined),
    onDragCancel: ({ active }) => labels.cancelled(nameOf(active.id))
  }
  return {
    announcements,
    screenReaderInstructions: { draggable: labels.instructions },
    ...override
  }
}

/** The name of the element a drag id points at: its `aria-label`, else its text, else the id. */
export function nameOfElement(selector: string, id: UniqueIdentifier, useText = true): string {
  const element = document.querySelector<HTMLElement>(selector)
  const text = useText ? element?.textContent?.replace(/\s+/g, ' ').trim() : undefined
  return element?.getAttribute('aria-label') || text || String(id)
}
