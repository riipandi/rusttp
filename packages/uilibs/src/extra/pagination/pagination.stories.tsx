import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, within } from 'storybook/test'
import { buttonSizes } from '../../base/button/button.stylex'
import { denseControlSizeNames, expectBoxSizes } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from './pagination.component'

const meta = {
  title: 'Extra Components/Pagination',
  component: Pagination,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Pagination>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  iconOnly: {
    paddingInline: 8,
    width: 36
  }
})

export default meta

// The page buttons take `size`; `page` is the story's current page, set as `isActive`.
type PlaygroundArgs = Pick<ComponentProps<typeof PaginationLink>, 'size'> & { page: number }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['size', 'page'] } },
  argTypes: {
    size: { control: 'select', options: Object.keys(buttonSizes) },
    page: { control: 'radio', options: [1, 2, 3] }
  },
  args: { size: 'medium', page: 2 },
  render: ({ size, page }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' />
        </PaginationItem>
        {[1, 2, 3].map((number) => (
          <PaginationItem key={number}>
            <PaginationLink href='#' size={size} isActive={number === page}>
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvas }) => {
    // Links are links, not buttons; the active page carries aria-current.
    await expect(canvas.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: '1' }).getAttribute('aria-current')).toBeNull()
    await expect(canvas.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument()
    await expect(within(canvas.getByRole('navigation')).queryAllByRole('button')).toHaveLength(0)
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Pagination labels={{ pagination: `Pages ${size}` }}>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href='#' size={size}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#' size={size} isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#' size={size}>
                3
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Axis>
  ),
  // The page links are squares as tall as a dense control of their size.
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, 'a', {
      xsmall: [28, 28],
      small: [32, 32],
      medium: [36, 36],
      large: [40, 40]
    })
}

export const Simple: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href='#' isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>3</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export const IconsOnly: Story = {
  name: 'Icons only',
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' labels={{ previous: '' }} style={styles.iconOnly} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' labels={{ next: '' }} style={styles.iconOnly} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/** Every built-in word comes from `labels`, so an app translates them in one place. */
export const Translated: Story = {
  render: () => {
    const labels = {
      pagination: 'Halaman',
      previous: 'Sebelumnya',
      previousPage: 'Ke halaman sebelumnya',
      next: 'Berikutnya',
      nextPage: 'Ke halaman berikutnya',
      morePages: 'Halaman lainnya'
    }
    return (
      <Pagination labels={labels}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' labels={labels} />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis labels={labels} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#' labels={labels} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Halaman' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ke halaman sebelumnya' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ke halaman berikutnya' })).toBeInTheDocument()
    await expect(canvas.getByText('Halaman lainnya')).toBeInTheDocument()
  }
}
