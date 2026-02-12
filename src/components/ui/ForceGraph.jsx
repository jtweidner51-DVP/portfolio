import { useEffect, useRef } from 'react'

function ForceGraph() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const rotationSpeed = useRef({ x: 0.002, y: 0.003 })
  const angleRef = useRef({ x: 0.3, y: 0.5 })

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
    })(42)

    const nodeCount = 20
    const nodes = []
    const s = 90

    nodes.push({ x: 0, y: 0, z: 0, size: 7, group: 0 })

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      nodes.push({
        x: Math.cos(angle) * s * 0.5 + (rand() - 0.5) * 20,
        y: Math.sin(angle) * s * 0.5 + (rand() - 0.5) * 20,
        z: (rand() - 0.5) * s * 0.4,
        size: 5,
        group: 1,
      })
    }

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + rand() * 0.5
      const radius = s * (0.7 + rand() * 0.5)
      nodes.push({
        x: Math.cos(angle) * radius + (rand() - 0.5) * 30,
        y: Math.sin(angle) * radius + (rand() - 0.5) * 30,
        z: (rand() - 0.5) * s * 0.6,
        size: 3 + rand() * 2,
        group: 2 + Math.floor(rand() * 3),
      })
    }

    const edges = []
    for (let i = 1; i <= 5; i++) edges.push([0, i])
    for (let i = 6; i < nodeCount; i++) {
      const closest = 1 + Math.floor(rand() * 5)
      edges.push([closest, i])
      if (rand() > 0.6) {
        const other = 1 + Math.floor(rand() * 5)
        if (other !== closest) edges.push([other, i])
      }
    }
    for (let i = 6; i < nodeCount - 1; i++) {
      if (rand() > 0.75) {
        const target = i + 1 + Math.floor(rand() * 3)
        if (target < nodeCount) edges.push([i, target])
      }
    }
    for (let i = 1; i <= 5; i++) edges.push([i, i < 5 ? i + 1 : 1])

    const groupColors = ['#667eea', '#a5b4fc', '#7c3aed', '#4ade80', '#f472b6']

    const floatOffsets = nodes.map(() => ({
      xPhase: rand() * Math.PI * 2,
      yPhase: rand() * Math.PI * 2,
      zPhase: rand() * Math.PI * 2,
      xAmp: 2 + rand() * 4,
      yAmp: 2 + rand() * 4,
      zAmp: 2 + rand() * 3,
      speed: 0.3 + rand() * 0.4,
    }))

    let time = 0

    function rotateX(point, a) {
      const [x, y, z] = point
      return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
    }

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

    function draw() {
      ctx.clearRect(0, 0, width, height)
      time += 0.016

      angleRef.current.x += rotationSpeed.current.x
      angleRef.current.y += rotationSpeed.current.y

      const transformed = nodes.map((node, i) => {
        const f = floatOffsets[i]
        const fx = Math.sin(time * f.speed + f.xPhase) * f.xAmp
        const fy = Math.cos(time * f.speed + f.yPhase) * f.yAmp
        const fz = Math.sin(time * f.speed + f.zPhase) * f.zAmp

        let p = [node.x + fx, node.y + fy, node.z + fz]
        p = rotateX(p, angleRef.current.x)
        p = rotateY(p, angleRef.current.y)
        return { projected: project(p), node }
      })

      edges.forEach(([i, j]) => {
        const [x1, y1, s1] = transformed[i].projected
        const [x2, y2, s2] = transformed[j].projected
        const avgDepth = (s1 + s2) / 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(102, 126, 234, ${avgDepth * 0.4})`
        ctx.lineWidth = avgDepth * 1.2
        ctx.stroke()
      })

      const indexed = transformed.map((t, i) => ({ ...t, i }))
      indexed.sort((a, b) => a.projected[2] - b.projected[2])

      indexed.forEach(({ projected: [x, y, scale], node }) => {
        const r = scale * node.size
        ctx.beginPath()
        ctx.arc(x, y, r * 3, 0, Math.PI * 2)
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
        glow.addColorStop(0, `rgba(102, 126, 234, ${scale * 0.2})`)
        glow.addColorStop(1, 'rgba(102, 126, 234, 0)')
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = groupColors[node.group]
        ctx.fill()
        ctx.strokeStyle = `rgba(255, 255, 255, ${scale * 0.5})`
        ctx.lineWidth = 0.5
        ctx.stroke()
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
      aria-label="Interactive 3D network visualization of web crawling connections"
      onMouseEnter={() => { rotationSpeed.current = { x: 0.012, y: 0.015 } }}
      onMouseLeave={() => { rotationSpeed.current = { x: 0.002, y: 0.003 } }}
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

export default ForceGraph
