import { FileText, Mic, Search, Sparkles } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { textColorStyles, textVariantStyles, textWeightStyles } from '../text/text.stylex'
import { LoaderText } from './loader-text.component'

const meta = {
  title: 'Extra Components/LoaderText',
  component: LoaderText,
  tags: [] // ['autodocs']
} satisfies Meta<typeof LoaderText>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['children', 'completed', 'completedText', 'variant', 'weight', 'color']
    }
  },
  argTypes: {
    children: { control: 'text' },
    completed: { control: 'boolean' },
    completedText: { control: 'text' },
    variant: { control: 'select', options: Object.keys(textVariantStyles) },
    weight: { control: 'select', options: Object.keys(textWeightStyles) },
    color: { control: 'select', options: Object.keys(textColorStyles) }
  },
  args: {
    icon: Mic,
    completed: false,
    completedText: 'Quill notes saved',
    children: 'Transcribing with the Quick-Quotes Quill'
  },
  render: (args) => <LoaderText {...args} />
}

/** Both texts stay mounted for the cross-fade; only the current one is visible. */
export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['loading', 'completed'] as const}>
      {(state) => (
        <LoaderText icon={Mic} completed={state === 'completed'} completedText='Quill notes saved'>
          Transcribing with the Quick-Quotes Quill
        </LoaderText>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const texts = (state: string) => {
      const cell = within(cellOf(canvasElement, 'state', state))
      return {
        loading: cell.getByText('Transcribing with the Quick-Quotes Quill'),
        completed: cell.getByText('Quill notes saved')
      }
    }
    const loading = texts('loading')
    await expect(loading.loading).toBeVisible()
    await expect(loading.completed).not.toBeVisible()
    const completed = texts('completed')
    await waitFor(() => expect(completed.loading).not.toBeVisible())
    await expect(completed.completed).toBeVisible()
  }
}

export const WithoutIcon: Story = {
  name: 'Text only',
  args: { children: 'Deciphering the cryptex' },
  render: (args) => <LoaderText {...args} />
}

export const Completed: Story = {
  render: () => {
    const [completed, setCompleted] = React.useState(false)

    return (
      <div {...stylex.props(styles.stack)}>
        <LoaderText completed>Deciphered 5 symbols</LoaderText>
        <LoaderText icon={Mic} completed={completed} completedText='Quill notes saved'>
          Transcribing with the Quick-Quotes Quill
        </LoaderText>
        <div>
          <Button variant='outline' size='sm' onClick={() => setCompleted((value) => !value)}>
            {completed ? 'Restart' : 'Complete'}
          </Button>
        </div>
      </div>
    )
  },
  play: async ({ canvas }) => {
    // Both texts stay mounted for the cross-fade; visibility flips over the
    // 200ms transition, so wait for the end state.
    const loading = canvas.getByText('Transcribing with the Quick-Quotes Quill')
    const completed = canvas.getByText('Quill notes saved')
    await expect(loading).toBeVisible()
    await expect(completed).not.toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Complete' }))
    await waitFor(() => expect(loading).not.toBeVisible())
    await expect(completed).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Restart' }))
    await waitFor(() => expect(completed).not.toBeVisible())
    await expect(loading).toBeVisible()
  }
}

export const Sequence: Story = {
  render: () => (
    <div
      {...stylex.props(
        atoms.display('flex'),
        atoms.flexDirection('column'),
        atoms.gap['12px'],
        atoms.width('100%')
      )}
    >
      <LoaderText icon={FileText} completed completedText='Read 3 articles'>
        Reading the Daily Prophet archive
      </LoaderText>
      <LoaderText icon={Search} completedText='Searched 128 footprints'>
        Consulting the Marauder&apos;s Map
      </LoaderText>
      <LoaderText icon={Sparkles} completedText='Lecture notes ready'>
        Drafting the symbology lecture
      </LoaderText>
    </div>
  )
}
