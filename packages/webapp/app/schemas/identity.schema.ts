import * as v from 'valibot'

// Who a person is, as the API will return them. `<Name>Response` is the type of a body read from
// the server; the Valibot schema beside it is what validates that body when a real source replaces
// the fixtures.

export const userSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  firstName: v.string(),
  initials: v.string()
})
export type UserResponse = v.InferOutput<typeof userSchema>

export const adminUserSchema = v.object({ ...userSchema.entries, role: v.string() })
export type AdminUserResponse = v.InferOutput<typeof adminUserSchema>
