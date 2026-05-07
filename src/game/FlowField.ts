export const GRID_W = 20
export const GRID_H = 20

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

export function buildFlowField(
  targetX: number,
  targetY: number,
  width = GRID_W,
  height = GRID_H,
): Int8Array {
  if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
    throw new RangeError(`buildFlowField: target (${targetX}, ${targetY}) out of bounds (${width}x${height})`)
  }

  const field = new Int8Array(width * height * 2)
  const visited = new Uint8Array(width * height)

  const flatIdx = (x: number, y: number) => y * width + x
  const fieldIdx = (x: number, y: number) => (y * width + x) * 2

  visited[flatIdx(targetX, targetY)] = 1
  // Flat interleaved queue: [x0, y0, x1, y1, ...]
  const queue: number[] = [targetX, targetY]
  let qi = 0

  while (qi < queue.length) {
    const cx = queue[qi++]
    const cy = queue[qi++]

    for (const [ndx, ndy] of DIRS) {
      const nx = cx + ndx
      const ny = cy + ndy
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      if (visited[flatIdx(nx, ny)]) continue
      visited[flatIdx(nx, ny)] = 1
      // Direction at (nx,ny) points toward (cx,cy)
      field[fieldIdx(nx, ny)] = cx - nx
      field[fieldIdx(nx, ny) + 1] = cy - ny
      queue.push(nx, ny)
    }
  }

  return field
}
