import { Mic } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { Button } from '../../base/button'
import { Field, FieldError, FieldLabel } from '../../base/field'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { FileUpload, FileUploadTrigger } from './file-upload.component'

const meta = {
  title: 'Extra Components/FileUpload',
  component: FileUpload
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

const styles = stylex.create({
  width: {
    maxWidth: 480,
    width: '100%'
  },
  col: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  icon: {
    height: 20,
    width: 20
  },
  previews: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  thumb: {
    borderRadius: 8,
    height: 60,
    objectFit: 'cover',
    width: 60
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  browse: {
    color: colors.foregroundPrimary,
    textDecoration: 'underline'
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 8
  },
  padded: {
    padding: 12
  },
  edgeProbe: {
    color: colors.borderControl
  }
})

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['variant', 'inline', 'disabled', 'height'] }
  },
  argTypes: {
    variant: { control: 'radio', options: ['outline', 'headless'] },
    inline: { control: 'boolean' },
    disabled: { control: 'boolean' },
    height: { control: { type: 'range', min: 80, max: 320, step: 20 } }
  },
  args: { name: 'file', variant: 'outline', inline: false, disabled: false, height: 160 },
  render: function PlaygroundRender(args) {
    const [files, setFiles] = React.useState<File[]>([])

    return (
      <div {...stylex.props(styles.stack, styles.width)}>
        <FileUpload {...args} onChange={(change) => setFiles((prev) => [...prev, ...change.value])}>
          <div {...stylex.props(styles.col)}>
            <Mic {...stylex.props(styles.icon)} strokeWidth={1.8} />
            Drop wand permits here
          </div>
        </FileUpload>
        {files.length > 0 ? (
          <div {...stylex.props(styles.previews)}>
            {files.map((file) => (
              <img
                key={file.name}
                src={URL.createObjectURL(file)}
                alt={file.name}
                {...stylex.props(styles.thumb)}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }
}

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FileUpload name='file-outline' variant='outline'>
  <div>
    <Mic />
    Drop wand permits here
  </div>
</FileUpload>

<FileUpload name='file-headless' variant='headless'>
  <Button variant='outline'>Upload wand permit</Button>
</FileUpload>`
      }
    }
  },
  args: { name: 'file' },
  render: () => (
    <Axis axis='variant' rows={['outline', 'headless'] as const}>
      {(variant) => (
        <FileUpload name={`file-${variant}`} variant={variant}>
          {variant === 'outline' ? (
            <div {...stylex.props(styles.col)}>
              <Mic {...stylex.props(styles.icon)} strokeWidth={1.8} />
              Drop wand permits here
            </div>
          ) : (
            <Button variant='outline'>Upload wand permit</Button>
          )}
        </FileUpload>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const box = (variant: string) => {
      // The drop surface is the label that wraps the hidden input.
      const el = cellOf(canvasElement, 'variant', variant).querySelector('label')
      if (!el) throw new Error(`No upload for ${variant}`)
      return getComputedStyle(el)
    }
    // The outline variant draws the drop zone's edge; headless draws nothing of its own.
    await expect(box('outline').borderTopStyle).toBe('dashed')
    await expect(box('headless').borderTopStyle).not.toBe('dashed')
  }
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FileUpload name='wand-disabled' disabled>
  <div>Drop wand permits here</div>
</FileUpload>

<Field invalid>
  <FieldLabel>Owl license</FieldLabel>
  <FileUpload name='owl-license' inputAttributes={{ accept: 'image/*' }}>
    Drop the license here
  </FileUpload>
  <FieldError match>The Owl Office needs a photo of the license.</FieldError>
</Field>`
      }
    }
  },
  args: { name: 'file' },
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel>Owl license</FieldLabel>
            <FileUpload name='owl-license' inputAttributes={{ accept: 'image/*' }}>
              Drop the license here
            </FileUpload>
            <FieldError match>The Owl Office needs a photo of the license.</FieldError>
          </Field>
        ) : (
          <FileUpload name={`wand-${state}`} disabled={state === 'disabled'}>
            <div {...stylex.props(styles.row)}>
              <Mic {...stylex.props(styles.icon)} strokeWidth={1.8} />
              Drop wand permits here
            </div>
          </FileUpload>
        )
      }
    </Axis>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('input[type="file"]')
      if (!el) throw new Error(`No file input for ${state}`)
      return el
    }
    await expect(input('default')).toBeEnabled()
    await expect(input('disabled')).toBeDisabled()

    const invalid = input('invalid')
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(canvas.getByLabelText('Owl license')).toBe(invalid)
  }
}

/** The keyboard stop is the hidden input: its drop zone draws a 2px ring, and an edge that clears 3:1. */
export const Focus: Story = {
  args: { name: 'file' },
  render: () => (
    <div {...stylex.props(styles.width)}>
      <span data-testid='edge' {...stylex.props(styles.edgeProbe)} />
      <FileUpload name='owl-license' inputAttributes={{ 'aria-label': 'Owl license' }}>
        Drop the license here
      </FileUpload>
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Owl license')
    const zone = input.closest('label')
    if (!zone) throw new Error('Drop zone not found')

    await expect(getComputedStyle(zone).outlineStyle).toBe('none')
    await expect(getComputedStyle(zone).borderTopColor).toBe(
      getComputedStyle(canvas.getByTestId('edge')).color
    )

    await userEvent.tab()
    await expect(input).toHaveFocus()
    const ring = getComputedStyle(zone)
    await expect(ring.outlineStyle).toBe('solid')
    await expect(ring.outlineWidth).toBe('2px')
  }
}

export const Trigger: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FileUpload name='file'>
  <div>
    Drop wand permits here, or{' '}
    <FileUploadTrigger>
      <span>browse Honeydukes</span>
    </FileUploadTrigger>
  </div>
</FileUpload>`
      }
    }
  },
  args: { name: 'file' },
  render: () => (
    <div {...stylex.props(styles.width)}>
      <FileUpload name='file'>
        <div>
          Drop wand permits here, or{' '}
          <FileUploadTrigger>
            <span {...stylex.props(styles.browse)}>browse Honeydukes</span>
          </FileUploadTrigger>
        </div>
      </FileUpload>
    </div>
  )
}

/** The headless composition: the picker wraps any trigger, inline or block. */
export const Headless: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FileUpload name='file' inline onChange={…}>
  <div>Owl order</div>
</FileUpload>

<FileUpload name='file-2' variant='headless' onChange={…}>
  <Button variant='outline'>Upload wand permit</Button>
</FileUpload>

<FileUpload name='file-4' variant='headless' inline onChange={…}>
  {(props) => (
    <Button variant={props.highlighted ? 'solid' : 'faded'}>Upload potion license</Button>
  )}
</FileUpload>`
      }
    }
  },
  args: { name: 'file' },
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <FileUpload name='file' inline onChange={console.log}>
        <div {...stylex.props(styles.padded)}>Owl order</div>
      </FileUpload>
      <FileUpload name='file-2' variant='headless' onChange={console.log}>
        <Button variant='outline'>Upload wand permit</Button>
      </FileUpload>
      <FileUpload name='file-3' variant='headless' inline onChange={console.log}>
        <Button>Upload broom license</Button>
      </FileUpload>
      <FileUpload name='file-4' variant='headless' inline onChange={console.log}>
        {(props) => (
          <Button variant={props.highlighted ? 'solid' : 'faded'}>Upload potion license</Button>
        )}
      </FileUpload>
    </div>
  )
}

export const Height: Story = {
  args: { name: 'file', height: 300 },
  render: (args) => (
    <div {...stylex.props(styles.width)}>
      <FileUpload {...args}>
        <div {...stylex.props(styles.col)}>
          <Mic {...stylex.props(styles.icon)} strokeWidth={1.8} />
          Drop wand permits here
        </div>
      </FileUpload>
    </div>
  )
}

export const OnChange: StoryObj<{
  name: string
  handleChange: ReturnType<typeof fn>
}> = {
  name: 'name, onChange',
  args: { name: 'test-name', handleChange: fn() },
  render: ({ name, handleChange }) => (
    <div data-testid='root' {...stylex.props(styles.width)}>
      <FileUpload name={name} onChange={handleChange}>
        Content
      </FileUpload>
    </div>
  ),
  play: async ({ canvas, args }) => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = canvas.getByTestId('root').querySelector('input')
    if (!(input instanceof HTMLInputElement)) throw new Error('FileUpload input not rendered')

    await userEvent.upload(input, file)

    await expect(input).toHaveAttribute('name', 'test-name')
    await expect(input.files?.[0]).toBe(file)
    await expect(input.files).toHaveLength(1)

    await expect(args.handleChange).toHaveBeenCalledTimes(1)
    await expect(args.handleChange).toHaveBeenCalledWith({
      name: 'test-name',
      value: [file],
      event: expect.objectContaining({ target: input })
    })
  }
}

/** A drop bypasses the input, so `accept` and `multiple` are applied to it by hand. */
export const DropRespectsAccept: Story = {
  name: 'Drop respects accept',
  args: { name: 'photos', onChange: fn() },
  render: (args) => (
    <FileUpload {...args} inputAttributes={{ accept: 'image/*,.pdf' }} style={styles.width}>
      Drop photos here
    </FileUpload>
  ),
  play: async ({ args, canvasElement }) => {
    const area = canvasElement.querySelector('input[type="file"]')?.closest('label')?.parentElement
    if (!area) throw new Error('Drop area not found')
    const files = [
      new File(['x'], 'sirius.png', { type: 'image/png' }),
      new File(['x'], 'howler.txt', { type: 'text/plain' }),
      new File(['x'], 'map.pdf', { type: 'application/pdf' })
    ]
    const dataTransfer = new DataTransfer()
    for (const file of files) dataTransfer.items.add(file)
    area.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }))
    // `multiple` is not set, so only the first accepted file is kept.
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'photos',
        value: [expect.objectContaining({ name: 'sirius.png' })]
      })
    )
  }
}
