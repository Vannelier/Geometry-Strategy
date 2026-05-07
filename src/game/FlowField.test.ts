import { describe, it, expect } from 'vitest'
import { buildFlowField } from './FlowField'

describe('buildFlowField', () => {
  it('returns Int8Array of length width * height * 2', () => {
    const field = buildFlowField(10, 10)
    expect(field).toBeInstanceOf(Int8Array)
    expect(field.length).toBe(20 * 20 * 2)
  })

  it('target cell (10,10) has zero direction', () => {
    const field = buildFlowField(10, 10)
    // fieldIdx(x=10, y=10) = (10*20 + 10) * 2 = 420
    expect(field[420]).toBe(0)  // dx
    expect(field[421]).toBe(0)  // dy
  })

  it('cell (9,10) — left of target — points east (dx=1, dy=0)', () => {
    const field = buildFlowField(10, 10)
    // fieldIdx(x=9, y=10) = (10*20 + 9) * 2 = 418
    expect(field[418]).toBe(1)  // dx = +1 (east toward x=10)
    expect(field[419]).toBe(0)  // dy = 0
  })

  it('cell (10,9) — above target — points south (dx=0, dy=1)', () => {
    const field = buildFlowField(10, 10)
    // fieldIdx(x=10, y=9) = (9*20 + 10) * 2 = 380
    expect(field[380]).toBe(0)  // dx = 0
    expect(field[381]).toBe(1)  // dy = +1 (south toward y=10)
  })

  it('cell (11,10) — right of target — points west (dx=-1, dy=0)', () => {
    const field = buildFlowField(10, 10)
    // fieldIdx(x=11, y=10) = (10*20 + 11) * 2 = 422
    expect(field[422]).toBe(-1) // dx = -1 (west toward x=10)
    expect(field[423]).toBe(0)  // dy = 0
  })

  it('corner cell (0,0) has non-zero direction', () => {
    const field = buildFlowField(10, 10)
    // fieldIdx(x=0, y=0) = 0
    const dx = field[0]
    const dy = field[1]
    expect(dx !== 0 || dy !== 0).toBe(true)
  })

  it('all 400 cells are reachable (no zero vector except target)', () => {
    const field = buildFlowField(10, 10)
    let unreachable = 0
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (x === 10 && y === 10) continue // target is expected zero
        const i = (y * 20 + x) * 2
        if (field[i] === 0 && field[i + 1] === 0) unreachable++
      }
    }
    expect(unreachable).toBe(0)
  })
})
