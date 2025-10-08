'use strict'

import { Flex } from 'smbls'

export const GridTable = {
  extend: Flex,
  props: {
    flow: 'column',
    gap: 'C',
    align: 'center'
  },

  Table: {
    tag: 'table',
    props: {
      border: '1px solid',
      borderCollapse: 'collapse',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      style: { userSelect: 'none' }
    },
    tbody: {
      tag: 'tbody',
      ...generateTableRows(20, 10)
    },
    on: {
      // Hover to update selection if not locked
      mouseover: (evt, element) => {
        const td = evt.target.closest('td')
        if (!td) return
        const table = element.node
        if (table._locked) return
        const [r1, c1] = getCoords(td)
        table._sel = { r0: 0, c0: 0, r1, c1 }
        paint(table)
      },
      // Clear selection on leave unless locked
      mouseleave: (evt, element) => {
        const table = element.node
        if (table._locked) return
        delete table._sel
        paint(table)
      },
      // Click to toggle lock/unlock
      click: (evt, element) => {
        const td = evt.target.closest('td')
        if (!td) return
        const table = element.node
        if (!table._sel) return
        table._locked = !table._locked
        if (!table._locked) {
          delete table._sel
          paint(table)
        }
      }
    }
  },

  SelectionInfo: {
    extend: Flex,
    props: {
      flow: 'row',
      gap: 'B',
      padding: 'B',
      fontSize: 'B',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 'A2'
    },
    CoordinateText: {
      tag: 'div',
      id: 'coordinate-text',
      text: 'Selection coordinates: 0 columns, 0 rows'
    },
    Separator: {
      tag: 'div',
      props: { margin: '0 A2' },
      text: '|'
    },
    TotalText: {
      tag: 'div',
      id: 'total-text',
      text: 'Total cells selected: 0'
    }
  }
}

/* ---------- helpers ---------- */
function getCoords (td) {
  const tr = td.parentNode
  return [tr.sectionRowIndex, td.cellIndex]
}

function paint (table) {
  const { r0, c0, r1, c1 } = table._sel || { r0: -1, c0: -1, r1: -1, c1: -1 }
  const top = Math.min(r0, r1)
  const bottom = Math.max(r0, r1)
  const left = Math.min(c0, c1)
  const right = Math.max(c0, c1)

  const numCols = right - left + 1
  const numRows = bottom - top + 1
  const total = numCols * numRows

  const coordEl = document.getElementById('coordinate-text')
  const totalEl = document.getElementById('total-text')

  if (coordEl && totalEl) {
    if (total > 0) {
      coordEl.textContent = `Selection coordinates: ${numCols} column${numCols !== 1 ? 's' : ''}, ${numRows} row${numRows !== 1 ? 's' : ''}`
      totalEl.textContent = `Total cells selected: ${total}`
    } else {
      coordEl.textContent = 'Selection coordinates: 0'
      totalEl.textContent = 'Total cells selected: 0'
    }
  }

  Array.from(table.rows).forEach((tr, r) => {
    Array.from(tr.cells).forEach((td, c) => {
      const inRange = r >= top && r <= bottom && c >= left && c <= right
      td.style.background = inRange ? '#3399ff' : 'transparent'
      td.style.color = inRange ? 'white' : 'inherit'
    })
  })
}

function generateTableRows (cols, rows) {
  const rowsObj = {}
  for (let r = 0; r < rows; r++) {
    const cellsObj = {}
    for (let c = 0; c < cols; c++) {
      cellsObj[`cell_${r}_${c}`] = {
        tag: 'td',
        props: {
          border: '1px solid #ddd',
          width: '32px',
          height: '32px',
          transition: 'background 0.15s',
          cursor: 'pointer'
        },
        text: ''
      }
    }
    rowsObj[`row_${r}`] = { tag: 'tr', ...cellsObj }
  }
  return rowsObj
}
