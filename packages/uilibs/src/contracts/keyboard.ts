import { userEvent, waitFor } from 'storybook/test'

/**
 * Presses `key` until `settled` passes. WebKit and a loaded runner lose a key sent while a popup
 * is still settling (focus reaches it a frame after it opens), so a single press is not a proof.
 *
 * Only an idempotent key repeats safely (`Escape`, `Home`, `End`, `Enter` on a closed trigger). A
 * key that moves state (`ArrowDown`, `Tab`) passes `when`: a precondition checked before each
 * press, so the key is sent only while the state has not moved yet.
 */
export async function pressUntil(
  key: string,
  settled: () => unknown,
  { when, timeout = 3000 }: { when?: () => boolean; timeout?: number } = {}
) {
  await waitFor(
    async () => {
      if (!when || when()) await userEvent.keyboard(key)
      await settled()
    },
    { timeout }
  )
}
