import type { AdminUserResponse, UserResponse } from '#/schemas/identity.schema'

// The signed-in person, until there is a session: the account menus and the navigation drawers read it.
export const profile: UserResponse = {
  name: 'Hermione Granger',
  email: 'hermione.granger@example.com',
  firstName: 'Hermione',
  initials: 'HG'
}

/** The admin layout adds the role to the same person. */
export const adminProfile: AdminUserResponse = { ...profile, role: 'Administrator' }

/** The address the "check your email" page names, until sign-up creates a real one. */
export const signupEmail = 'sophie.neveu@example.com'
