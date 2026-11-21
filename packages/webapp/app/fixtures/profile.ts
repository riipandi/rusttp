import type { Profile } from '#/libraries/profile'

// The signed-in person, until there is a session: the account menus and the navigation drawers read it.
export const profile: Profile = {
  name: 'Hermione Granger',
  email: 'hermione.granger@example.com',
  firstName: 'Hermione',
  initials: 'HG'
}

/** The admin layout adds the role to the same person. */
export const adminProfile: Profile & { role: string } = { ...profile, role: 'Administrator' }

/** The address the "check your email" page names, until sign-up creates a real one. */
export const signupEmail = 'sophie.neveu@example.com'
