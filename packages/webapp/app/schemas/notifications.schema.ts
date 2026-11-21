import * as v from 'valibot'

// A notification, as the API will return it (see `identity.schema.ts`).

export const notificationSchema = v.object({
  id: v.string(),
  title: v.string(),
  body: v.string(),
  /** Shown as written: there is no clock behind the sample data. */
  time: v.string(),
  read: v.boolean()
})
export type NotificationResponse = v.InferOutput<typeof notificationSchema>
