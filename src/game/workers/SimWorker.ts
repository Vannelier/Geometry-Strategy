/// <reference lib="webworker" />
import { buildFlowField, GRID_W, GRID_H } from '../FlowField'

const UNIT_COUNT = 50
const SPEED = 2.0
const DT = 1 / 60
const TARGET_X = Math.floor(GRID_W / 2)
const TARGET_Y = Math.floor(GRID_H / 2)
const RESPAWN_DIST_SQ = 0.5 * 0.5

const field = buildFlowField(TARGET_X, TARGET_Y)
const positions = new Float32Array(UNIT_COUNT * 2)

function randomBorderPos(): [number, number] {
  const side = Math.floor(Math.random() * 4)
  const t = Math.random() * (GRID_W - 1)
  if (side === 0) return [t, 0]
  if (side === 1) return [t, GRID_H - 1]
  if (side === 2) return [0, t]
  return [GRID_W - 1, t]
}

for (let i = 0; i < UNIT_COUNT; i++) {
  const [x, y] = randomBorderPos()
  positions[i * 2] = x
  positions[i * 2 + 1] = y
}

function tick(): void {
  for (let i = 0; i < UNIT_COUNT; i++) {
    const x = positions[i * 2]
    const y = positions[i * 2 + 1]

    const cx = Math.min(Math.floor(x), GRID_W - 1)
    const cy = Math.min(Math.floor(y), GRID_H - 1)
    const fi = (cy * GRID_W + cx) * 2
    const dx = field[fi]
    const dy = field[fi + 1]

    let nx = x + dx * SPEED * DT
    let ny = y + dy * SPEED * DT

    nx = Math.max(0, Math.min(GRID_W - 0.01, nx))
    ny = Math.max(0, Math.min(GRID_H - 0.01, ny))

    const ddx = nx - TARGET_X
    const ddy = ny - TARGET_Y
    if (ddx * ddx + ddy * ddy < RESPAWN_DIST_SQ) {
      const [rx, ry] = randomBorderPos()
      positions[i * 2] = rx
      positions[i * 2 + 1] = ry
    } else {
      positions[i * 2] = nx
      positions[i * 2 + 1] = ny
    }
  }

  self.postMessage({ type: 'SNAPSHOT', positions })
}

let intervalId: ReturnType<typeof setInterval> | null = null

self.onmessage = (e: MessageEvent) => {
  if (e.data.type === 'START' && intervalId === null) {
    intervalId = setInterval(tick, Math.round(1000 / 60))
  }
  if (e.data.type === 'STOP' && intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}
