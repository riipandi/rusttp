import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect } from 'storybook/test'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { Select, SelectTrigger, SelectValue } from '../base/select'
import { Textarea } from '../extra/textarea'

const styles = stylex.create({
  grid: {
    alignItems: 'center',
    display: 'grid',
    gap: 12,
    gridTemplateColumns: '120px 260px',
    padding: 20
  },
  caption: { fontSize: 13, opacity: 0.7 }
})

const meta = {
  title: 'Contracts/Ref as a prop',
  parameters: {
    layout: 'centered',
    // A row of every wrapper on purpose: it is wider than a phone.
    overflow: 'allowed',
    docs: {
      description: {
        component: 'Every wrapper takes `ref` as a prop (React 19), not through `forwardRef`.'
      }
    }
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** Every wrapper takes `ref` as a prop (React 19); a type error here fails `just typecheck`. */
export const RefAsAProp: Story = {
  name: 'Ref as a prop',
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
      <div data-testid='refs' data-tags={tags} {...stylex.props(styles.grid)}>
        <span {...stylex.props(styles.caption)}>Input</span>
        <Input ref={input} aria-label='Spell' placeholder='Spell' />
        <span {...stylex.props(styles.caption)}>Button</span>
        <Button ref={button}>Alohomora</Button>
        <span {...stylex.props(styles.caption)}>Textarea</span>
        <Textarea ref={textarea} aria-label='Prophecy' placeholder='Prophecy' />
        <span {...stylex.props(styles.caption)}>Textarea, auto-resize</span>
        <Textarea
          ref={textareaAuto}
          autoResize
          aria-label='Marauder entry'
          placeholder='Marauder entry'
        />
        <span {...stylex.props(styles.caption)}>Select trigger</span>
        <Select items={[{ value: 'gryffindor', label: 'Gryffindor' }]}>
          <SelectTrigger ref={trigger} aria-label='House'>
            <SelectValue placeholder='House' />
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
