import * as v from 'valibot'

// A notification, as the API will return it (see `identity.schema.ts`).

export const notificationSchema = v.object({
  id: v.string(),
  title: v.string(),
  body: v.string(),
  /** When it happened, an ISO timestamp; the popover shows how long ago. */
  time: v.pipe(v.string(), v.isoTimestamp()),
  read: v.boolean()
})
export type NotificationResponse = v.InferOutput<typeof notificationSchema>
