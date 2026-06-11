import { useEffect, useRef } from 'react'

function GroundTruthGraph() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const swaySpeed = useRef(0.4)
  const swayAngleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const width = 400
    const height = 250
    canvas.width = width
    canvas.height = height

    const rand = (function (seed) {
      let s = seed
      return function () {
        s = (s * 16807 + 0) % 2147483647
        return s / 2147483647
      }
    })(99)

    // -----------------------------------------------------------------------
    // Hierarchical tree layout — 3 levels
    // Level 0: root (index 0)         — y = -90
    // Level 1: department nodes 1–5   — y = -20
    // Level 2: knowledge nodes 6–18   — y = +70
    // -----------------------------------------------------------------------

    const nodes = []

    // Root node
    nodes.push({ x: 0, y: -90, z: 0, size: 8, type: 'root', level: 0 })

    // Department nodes — spread horizontally
    const deptCount = 5
    const deptSpread = 160
    for (let i = 0; i < deptCount; i++) {
      const t = deptCount === 1 ? 0 : (i / (deptCount - 1)) - 0.5
      nodes.push({
        x: t * deptSpread + (rand() - 0.5) * 12,
        y: -20 + (rand() - 0.5) * 10,
        z: (rand() - 0.5) * 30,
        size: 7,
        type: 'department',
        level: 1,
      })
    }

    // Knowledge nodes — spread across bottom level, grouped loosely under depts
    const knowledgeCount = 13
    const knowledgeSpread = 190
    for (let i = 0; i < knowledgeCount; i++) {
      const t = knowledgeCount === 1 ? 0 : (i / (knowledgeCount - 1)) - 0.5
      nodes.push({
        x: t * knowledgeSpread + (rand() - 0.5) * 18,
        y: 70 + (rand() - 0.5) * 14,
        z: (rand() - 0.5) * 40,
        size: 2.5 + rand() * 1.8,
        type: 'knowledge',
        level: 2,
      })
    }

    const nodeCount = nodes.length

    // Assign connection states
    const nodeState = nodes.map((n) => {
      if (n.type === 'root') return 'healthy'
      const r = rand()
      if (r < 0.45) return 'healthy'
      if (r < 0.75) return 'stalling'
      return 'isolated'
    })

    const stateColors = {
      healthy: '#4ade80',
      stalling: '#f59e0b',
      isolated: '#f87171',
    }

    // Edges: root → each dept, each knowledge → nearest dept
    const edges = []
    for (let i = 1; i <= deptCount; i++) {
      edges.push([0, i])
    }
    for (let i = deptCount + 1; i < nodeCount; i++) {
      if (nodeState[i] === 'isolated') continue
      // Assign to dept whose x is closest
      const kx = nodes[i].x
      let bestDept = 1
      let bestDist = Infinity
      for (let d = 1; d <= deptCount; d++) {
        const dist = Math.abs(nodes[d].x - kx)
        if (dist < bestDist) { bestDist = dist; bestDept = d }
      }
      edges.push([bestDept, i])
      // Occasional second connection
      if (rand() > 0.72) {
        const other = 1 + Math.floor(rand() * deptCount)
        if (other !== bestDept) edges.push([other, i])
      }
    }

    const floatOffsets = nodes.map(() => ({
      xPhase: rand() * Math.PI * 2,
      yPhase: rand() * Math.PI * 2,
      zPhase: rand() * Math.PI * 2,
      xAmp: 1.5 + rand() * 2.5,
      yAmp: 1 + rand() * 2,
      zAmp: 1 + rand() * 2,
      speed: 0.2 + rand() * 0.3,
    }))

    // Y positions for the three levels (used for level lines)
    const levelYBase = [-90, -20, 70]

    let time = 0

    function rotateY(point, a) {
      const [x, y, z] = point
      return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
    }

    function project(point) {
      const [x, y, z] = point
      const perspective = 500
      const sc = perspective / (perspective + z)
      return [x * sc + width / 2, y * sc + height / 2, sc]
    }

    function drawDiamond(ctx, x, y, r) {
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r, y)
      ctx.lineTo(x, y + r)
      ctx.lineTo(x - r, y)
      ctx.closePath()
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      time += 0.016

      // Gentle sway: oscillate Y-axis angle left and right
      swayAngleRef.current = Math.sin(time * swaySpeed.current * 0.5) * 0.35

      const transformed = nodes.map((node, i) => {
        const f = floatOffsets[i]
        const fx = Math.sin(time * f.speed + f.xPhase) * f.xAmp
        const fy = Math.cos(time * f.speed + f.yPhase) * f.yAmp
        const fz = Math.sin(time * f.speed + f.zPhase) * f.zAmp

        let p = [node.x + fx, node.y + fy, node.z + fz]
        p = rotateY(p, swayAngleRef.current)
        return { projected: project(p), node, state: nodeState[i] }
      })

      // --- Level lines ---
      levelYBase.forEach((lyBase) => {
        // Project a point at this y level to get screen y (use centre x/z)
        const [, screenY] = project(rotateY([0, lyBase, 0], swayAngleRef.current))
        ctx.beginPath()
        ctx.moveTo(20, screenY)
        ctx.lineTo(width - 20, screenY)
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.12)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 8])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // --- Edges ---
      edges.forEach(([i, j]) => {
        const [x1, y1, s1] = transformed[i].projected
        const [x2, y2, s2] = transformed[j].projected
        const avgDepth = (s1 + s2) / 2
        const si = transformed[i].state
        const sj = transformed[j].state
        const edgeState = (si === 'healthy' && sj === 'healthy') ? 'healthy' : 'stalling'
        const color = stateColors[edgeState]
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.globalAlpha = avgDepth * 0.5
        ctx.strokeStyle = color
        ctx.lineWidth = avgDepth * 1.1
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      // --- Nodes (back-to-front) ---
      const indexed = transformed.map((t, i) => ({ ...t, i }))
      indexed.sort((a, b) => a.projected[2] - b.projected[2])

      indexed.forEach(({ projected: [x, y, scale], node, state }) => {
        const r = scale * node.size
        const color = stateColors[state]

        // Glow
        const glowR = r * (node.type === 'department' ? 4 : 3)
        ctx.beginPath()
        ctx.arc(x, y, glowR, 0, Math.PI * 2)
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR)
        ctx.globalAlpha = scale * 0.22
        glow.addColorStop(0, color)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.fill()
        ctx.globalAlpha = 1

        if (node.type === 'department' || node.type === 'root') {
          // Diamond shape
          const dr = r * 1.35
          drawDiamond(ctx, x, y, dr)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = `rgba(255, 255, 255, ${scale * 0.6})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        } else {
          // Circle for knowledge nodes
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = `rgba(255, 255, 255, ${scale * 0.4})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Interactive 3D knowledge graph showing organisational AI adoption patterns"
      onMouseEnter={() => { swaySpeed.current = 2.2 }}
      onMouseLeave={() => { swaySpeed.current = 0.4 }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
      }}
    />
  )
}

export default GroundTruthGraph
