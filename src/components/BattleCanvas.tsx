import { useEffect, useRef } from 'react'
import { Application, Graphics } from 'pixi.js'

const GRID_W = 20
const GRID_H = 20
const CELL_SIZE = 30        // pixels per grid cell → 600×600 canvas
const UNIT_COUNT = 50
const TARGET_X = 10
const TARGET_Y = 10

export function BattleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true
    const latestSnapshot = { current: null as Float32Array | null }

    const worker = new Worker(
      new URL('../game/workers/SimWorker.ts', import.meta.url),
      { type: 'module' },
    )

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'SNAPSHOT') {
        latestSnapshot.current = e.data.positions as Float32Array
      }
    }

    const app = new Application()

    ;(async () => {
      await app.init({
        width: GRID_W * CELL_SIZE,
        height: GRID_H * CELL_SIZE,
        background: 0x1a1a2e,
      })

      if (!mounted) {
        app.destroy(true)
        return
      }

      containerRef.current!.appendChild(app.canvas)

      // Red square — static, added first so it renders behind units
      const redSprite = new Graphics()
      redSprite.rect(-10, -10, 20, 20).fill(0xff3333)
      redSprite.x = TARGET_X * CELL_SIZE + CELL_SIZE / 2
      redSprite.y = TARGET_Y * CELL_SIZE + CELL_SIZE / 2
      app.stage.addChild(redSprite)

      // 50 blue circles — created once, repositioned each frame
      const sprites: Graphics[] = []
      for (let i = 0; i < UNIT_COUNT; i++) {
        const g = new Graphics()
        g.circle(0, 0, 8).fill(0x4488ff)
        app.stage.addChild(g)
        sprites.push(g)
      }

      // PixiJS ticker: read latest snapshot and update sprite positions
      app.ticker.add(() => {
        const snap = latestSnapshot.current
        if (!snap) return
        for (let i = 0; i < UNIT_COUNT; i++) {
          sprites[i].x = snap[i * 2] * CELL_SIZE + CELL_SIZE / 2
          sprites[i].y = snap[i * 2 + 1] * CELL_SIZE + CELL_SIZE / 2
        }
      })

      worker.postMessage({ type: 'START' })
    })()

    return () => {
      mounted = false
      worker.terminate()
      app.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
