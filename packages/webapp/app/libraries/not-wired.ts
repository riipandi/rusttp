/**
 * A control that has no backend yet calls this instead of doing nothing: one line in the console
 * says what was pressed, so a developer sees it was heard. The line is for developers, not users,
 * so it is plain English and not a message. Replace the call with the real action.
 */
export function notWired(what: string) {
  return () => console.info(`[not wired] ${what}`)
}
