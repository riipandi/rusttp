import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as React from 'react'
import { expect } from 'storybook/test'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { Select, SelectTrigger, SelectValue } from '../base/select'
import { Textarea } from '../extra/textarea'

const meta = {
  title: 'Contracts/Ref',
  parameters: { layout: 'centered' }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** Every wrapper takes `ref` as a prop (React 19); a type error here fails `just typecheck`. */
export const RefReachesTheElement: Story = {
  render: () => {
    const input = React.useRef<HTMLInputElement>(null)
    const button = React.useRef<HTMLButtonElement>(null)
    const textarea = React.useRef<HTMLTextAreaElement>(null)
    const textareaAuto = React.useRef<HTMLTextAreaElement>(null)
    const trigger = React.useRef<HTMLButtonElement>(null)
    const [tags, setTags] = React.useState('')

    React.useEffect(() => {
      setTags(
        [input, button, textarea, textareaAuto, trigger]
          .map((ref) => ref.current?.tagName.toLowerCase())
          .join(',')
      )
    }, [])

    return (
      <div data-testid='refs' data-tags={tags}>
        <Input ref={input} aria-label='Spell' />
        <Button ref={button}>Alohomora</Button>
        <Textarea ref={textarea} aria-label='Prophecy' />
        <Textarea ref={textareaAuto} autoResize aria-label='Marauder entry' />
        <Select items={[{ value: 'gryffindor', label: 'Gryffindor' }]}>
          <SelectTrigger ref={trigger} aria-label='House'>
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('refs')).toHaveAttribute(
      'data-tags',
      'input,button,textarea,textarea,button'
    )
  }
}
