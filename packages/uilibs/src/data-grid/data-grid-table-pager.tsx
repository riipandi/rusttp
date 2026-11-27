import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { ChevronLeft, ChevronRight } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import { Button, buttonSquare } from '../base/button'
import { SelectContent, SelectTrigger, SelectValue } from '../base/select'
import { Select, SelectItem } from '../base/select'
import { Skeleton } from '../extra/skeleton'
import { visuallyHidden } from '../styles/utils.stylex'
import { useDataGrid, type DataGridTableInstance } from './data-grid'
import { dataGridPaginationStyles } from './data-grid-table.stylex'
import { dataGridScrollAreaStyles } from './data-grid.stylex'

type DataGridScrollAreaOrientation = 'horizontal' | 'vertical' | 'both'

type DataGridScrollAreaProps = Omit<
  BaseScrollArea.Root.Props,
  'children' | 'className' | 'style'
> & {
  children: ReactNode
  style?: StyleXStyles
  orientation?: DataGridScrollAreaOrientation
}

const scrollbarInset = stylex.create({
  inset: (start: number, end: number) => ({
    marginInlineEnd: end > 0 ? `${end}px` : null,
    marginInlineStart: start > 0 ? `${start}px` : null
  }),
  // Base UI pins its track to `top: 0` inline, which no class beats; a margin moves it down.
  top: (offset: number) => ({ marginTop: `${offset}px` })
})

interface DataGridPaginationProps {
  sizes?: number[]
  sizesSkeleton?: ReactNode
  moreLimit?: number
  info?: string
  infoSkeleton?: ReactNode
  style?: StyleXStyles
  rowsPerPageLabel?: string
  previousPageLabel?: string
  nextPageLabel?: string
  ellipsisText?: string
}

function DataGridPagination<TData extends object>(
  props: DataGridPaginationProps & { table: DataGridTableInstance<TData> }
): JSX.Element {
  const s = dataGridPaginationStyles
  const { labels, recordCount, isLoading } = useDataGrid()
  const { table } = props

  const defaultProps: Partial<DataGridPaginationProps> = {
    sizes: [5, 10, 25, 50, 100],
    sizesSkeleton: <Skeleton style={s.sizesSkeleton} />,
    moreLimit: 5,
    infoSkeleton: <Skeleton style={s.infoSkeleton} />,
    rowsPerPageLabel: labels.rowsPerPage,
    previousPageLabel: labels.previousPage,
    nextPageLabel: labels.nextPage,
    ellipsisText: labels.paginationEllipsis
  }

  const mergedProps: DataGridPaginationProps = { ...defaultProps, ...props }

  const pageIndex = table.state.pagination.pageIndex
  const pageSize = table.state.pagination.pageSize
  const from = recordCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, recordCount)
  const pageCount = table.getPageCount()

  // A supplied `info` keeps its placeholder-template contract; the default
  // routes through the label function, where word order is free.
  const paginationInfo = mergedProps.info
    ? mergedProps.info
        .replaceAll('{from}', from.toString())
        .replaceAll('{to}', to.toString())
        .replaceAll('{count}', recordCount.toString())
    : labels.paginationInfo({ from, to, count: recordCount })

  // Pagination limit logic
  const paginationMoreLimit = mergedProps.moreLimit || 5

  // Determine the start and end of the pagination group
  const currentGroupStart = Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit
  const currentGroupEnd = Math.min(currentGroupStart + paginationMoreLimit, pageCount)

  // Render page buttons based on the current group
  const renderPageButtons = () => {
    const buttons = []
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size='small'
          variant='ghost'
          aria-label={labels.goToPage(i + 1)}
          aria-current={pageIndex === i ? 'page' : undefined}
          style={[
            buttonSquare.small,
            s.pageButton,
            s.pageButtonMuted,
            pageIndex === i && s.pageButtonActive
          ]}
          onClick={() => {
            if (pageIndex !== i) {
              table.setPageIndex(i)
            }
          }}
        >
          {i + 1}
        </Button>
      )
    }
    return buttons
  }

  // Render a "previous" ellipsis button if there are previous pages to show
  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return (
        <Button
          size='small'
          variant='ghost'
          style={[buttonSquare.small, s.pageButton]}
          onClick={() => table.setPageIndex(currentGroupStart - 1)}
        >
          {mergedProps.ellipsisText}
        </Button>
      )
    }
    return null
  }

  // Render a "next" ellipsis button if there are more pages to show after the current group
  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          size='small'
          variant='ghost'
          style={[buttonSquare.small, s.pageButton]}
          onClick={() => table.setPageIndex(currentGroupEnd)}
        >
          {mergedProps.ellipsisText}
        </Button>
      )
    }
    return null
  }

  return (
    <div data-slot='data-grid-pagination' {...stylex.props(s.root, mergedProps.style)}>
      <div {...stylex.props(s.sizes)}>
        {isLoading ? (
          mergedProps.sizesSkeleton
        ) : (
          <>
            <div {...stylex.props(s.mutedText)}>{mergedProps.rowsPerPageLabel}</div>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value)
                table.setPageSize(newPageSize)
              }}
            >
              <SelectTrigger aria-label={mergedProps.rowsPerPageLabel} style={s.pageSizeTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='start' alignItemWithTrigger={false} style={s.pageSizeContent}>
                {mergedProps.sizes?.map((size: number) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div {...stylex.props(s.info)}>
        {isLoading ? (
          mergedProps.infoSkeleton
        ) : (
          <>
            <div {...stylex.props(s.infoText)}>{paginationInfo}</div>
            {pageCount > 1 && (
              <nav aria-label={labels.pagination} {...stylex.props(s.pages)}>
                <Button
                  size='small'
                  variant='ghost'
                  style={[buttonSquare.small, s.arrowButton]}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span {...stylex.props(visuallyHidden.root)}>
                    {mergedProps.previousPageLabel}
                  </span>
                  <ChevronLeft {...stylex.props(s.arrowIcon)} />
                </Button>

                {renderEllipsisPrevButton()}

                {renderPageButtons()}

                {renderEllipsisNextButton()}

                <Button
                  size='small'
                  variant='ghost'
                  style={[buttonSquare.small, s.arrowButton]}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span {...stylex.props(visuallyHidden.root)}>{mergedProps.nextPageLabel}</span>
                  <ChevronRight {...stylex.props(s.arrowIcon)} />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export { DataGridPagination, type DataGridPaginationProps }

function DataGridScrollArea<TData extends object>({
  children,
  style,
  orientation = 'both',
  table,
  ...props
}: DataGridScrollAreaProps & { table: DataGridTableInstance<TData> }) {
  const s = dataGridScrollAreaStyles
  const { props: dataGridProps } = useDataGrid()
  const containerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  const showHorizontal = orientation !== 'vertical'
  const showVertical = orientation !== 'horizontal'
  const hasStickyHeader = showVertical && !!dataGridProps.tableLayout?.headerSticky
  // Pinned columns are sticky and never scroll, so the horizontal scrollbar
  // track is inset to span only the scrollable center region between them.
  const isColumnsPinnable = !!dataGridProps.tableLayout?.columnsPinnable
  const scrollbarInsetStart = isColumnsPinnable ? table.getStartTotalSize() : 0
  const scrollbarInsetEnd = isColumnsPinnable ? table.getEndTotalSize() : 0

  // The vertical track of a sticky-header grid starts where the header ends: the header never
  // scrolls, so a thumb alongside it would travel over a stretch that does not move.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasStickyHeader) return undefined

    const resizeObserver = new ResizeObserver((entries) => {
      const header = entries[0]?.target
      if (header) setHeaderHeight(header.getBoundingClientRect().height)
    })
    const observeHeader = () => {
      const header = container.querySelector('[data-slot="data-grid-table"] thead')
      if (header) resizeObserver.observe(header)
      return !!header
    }

    // A table that mounts after this effect (empty state swapped for data) is picked up once.
    let mutationObserver: MutationObserver | null = null
    if (!observeHeader()) {
      mutationObserver = new MutationObserver(() => {
        if (observeHeader()) mutationObserver?.disconnect()
      })
      mutationObserver.observe(container, { childList: true, subtree: true })
    }

    return () => {
      resizeObserver.disconnect()
      mutationObserver?.disconnect()
    }
  }, [hasStickyHeader])

  return (
    <div ref={containerRef} {...stylex.props(s.root)}>
      <BaseScrollArea.Root
        data-slot='data-grid-scroll-area'
        {...props}
        {...stylex.props(s.root, style)}
      >
        <BaseScrollArea.Viewport data-slot='scroll-area-viewport' {...stylex.props(s.viewport)}>
          <BaseScrollArea.Content data-slot='scroll-area-content'>
            {children}
          </BaseScrollArea.Content>
        </BaseScrollArea.Viewport>

        {showHorizontal && (
          <BaseScrollArea.Scrollbar
            data-slot='data-grid-scrollbar'
            data-orientation='horizontal'
            orientation='horizontal'
            {...stylex.props(
              s.scrollbar,
              s.scrollbarHorizontal,
              (scrollbarInsetStart > 0 || scrollbarInsetEnd > 0) &&
                scrollbarInset.inset(scrollbarInsetStart, scrollbarInsetEnd)
            )}
          >
            <BaseScrollArea.Thumb data-slot='data-grid-thumb' {...stylex.props(s.thumb)} />
          </BaseScrollArea.Scrollbar>
        )}

        {showVertical && (
          <BaseScrollArea.Scrollbar
            data-slot='data-grid-scrollbar'
            data-orientation='vertical'
            orientation='vertical'
            {...stylex.props(
              s.scrollbar,
              hasStickyHeader ? s.scrollbarVerticalSticky : s.scrollbarVertical,
              hasStickyHeader && scrollbarInset.top(headerHeight)
            )}
          >
            <BaseScrollArea.Thumb data-slot='data-grid-thumb' {...stylex.props(s.thumb)} />
          </BaseScrollArea.Scrollbar>
        )}

        {/* Where the two tracks meet, so the vertical one stops above the horizontal one. */}
        {hasStickyHeader && showHorizontal && <BaseScrollArea.Corner />}
      </BaseScrollArea.Root>
    </div>
  )
}

export { DataGridScrollArea }
export type { DataGridScrollAreaOrientation, DataGridScrollAreaProps }
