import React, { useState, useRef, useEffect } from 'react'
import './Step5Facade.css'

const GLASS_COST_PSF = { standard: 28, highPerf: 55, triple: 95, electrochromic: 180 }
const WALL_COST_PSF = { concrete: 22, terracotta: 38, metalPanel: 32, stone: 65 }
const ENERGY_BASE_PSF_YR = 4.50 // $/sf/yr base energy cost

export default function Step5Facade({ state, update, onBack }) {
  const [glassN, setGlassN] = useState(30)
  const [glassS, setGlassS] = useState(55)
  const [glassE, setGlassE] = useState(45)
  const [glassW, setGlassW] = useState(35)
  const [winH, setWinH] = useState(7)
  const [winW, setWinW] = useState(5)
  const [winSpacing, setWinSpacing] = useState(3)
  const [glassType, setGlassType] = useState('highPerf')
  const [wallType, setWallType] = useState('metalPanel')
  const [activeView, setActiveView] = useState('S')
  const canvasRef = useRef(null)

  const programs = state.selectedPrograms || []
  const totalSF = programs.reduce((s, p) => s + (p.sf || 0), 0)
  const floorH = 14
  const floors = Math.max(1, Math.round(totalSF / (((state.lotW || 120) - (state.sideSB || 10) * 2) * ((state.lotD || 160) - (state.frontSB || 15) - (state.rearSB || 20)))))
  const totalH = floors * floorH

  const facadeW = { N: (state.lotW || 120) - (state.sideSB || 10) * 2, S: (state.lotW || 120) - (state.sideSB || 10) * 2, E: (state.lotD || 160) - (state.frontSB || 15) - (state.rearSB || 20), W: (state.lotD || 160) - (state.frontSB || 15) - (state.rearSB || 20) }
  const glassRatios = { N: glassN, S: glassS, E: glassE, W: glassW }

  // Cost calculations
  const facadeAreas = {}
  let totalGlassArea = 0, totalWallArea = 0
  Object.entries(facadeW).forEach(([face, w]) => {
    const totalArea = w * totalH
    const glassArea = totalArea * glassRatios[face] / 100
    const wallArea = totalArea - glassArea
    facadeAreas[face] = { total: totalArea, glass: glassArea, wall: wallArea }
    totalGlassArea += glassArea
    totalWallArea += wallArea
  })

  const glassCost = Math.round(totalGlassArea * GLASS_COST_PSF[glassType])
  const wallCost = Math.round(totalWallArea * WALL_COST_PSF[wallType])
  const totalFacadeCost = glassCost + wallCost

  // Energy model
  const avgGlassRatio = (glassN + glassS + glassE + glassW) / 4
  const solarHeatGain = (glassS * 0.8 + glassW * 1.2 + glassE * 0.6 + glassN * 0.2) / 4
  const annualEnergyCost = Math.round(totalSF * ENERGY_BASE_PSF_YR * (1 + (solarHeatGain - 40) / 100 * 0.3))
  const energySaving = Math.round(totalSF * ENERGY_BASE_PSF_YR * 0.15 * (glassType === 'electrochromic' ? 2 : glassType === 'triple' ? 1.5 : 1))

  // Draw facade preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const fw = facadeW[activeView]
    const fh = totalH
    const scaleX = (W - 40) / fw
    const scaleY = (H - 40) / fh
    const scale = Math.min(scaleX, scaleY)
    const offX = (W - fw * scale) / 2
    const offY = (H - fh * scale) / 2
    const glassRatio = glassRatios[activeView] / 100

    // Background (wall)
    ctx.fillStyle = '#1a2535'
    ctx.fillRect(offX, offY, fw * scale, fh * scale)

    // Draw floors with windows
    const wW = winW * scale, wH = winH * scale
    const gutter = winSpacing * scale
    const cols = Math.max(1, Math.floor((fw * scale + gutter) / (wW + gutter)))
    const rows = floors
    const totalWinW = cols * wW + (cols - 1) * gutter
    const panelOffX = offX + (fw * scale - totalWinW) / 2
    const floorPx = fh * scale / rows

    for (let row = 0; row < rows; row++) {
      const fy = offY + row * floorPx
      // floor line
      ctx.strokeStyle = 'rgba(100,160,255,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(offX, fy)
      ctx.lineTo(offX + fw * scale, fy)
      ctx.stroke()

      for (let col = 0; col < cols; col++) {
        if (Math.random() > glassRatio * 1.2) continue
        const wx = panelOffX + col * (wW + gutter)
        const wy = fy + (floorPx - wH) / 2
        const grad = ctx.createLinearGradient(wx, wy, wx + wW, wy + wH)
        grad.addColorStop(0, 'rgba(100,180,255,0.65)')
        grad.addColorStop(0.5, 'rgba(180,220,255,0.45)')
        grad.addColorStop(1, 'rgba(60,100,160,0.7)')
        ctx.fillStyle = grad
        ctx.fillRect(wx, wy, wW, wH)
        // reflection
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(wx + 2, wy + 2, wW * 0.3, wH * 0.6)
      }
    }

    // Outline
    ctx.strokeStyle = 'rgba(100,160,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(offX, offY, fw * scale, fh * scale)

    // Label
    ctx.fillStyle = 'rgba(100,160,255,0.6)'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.fillText(`${activeView} — ${glassRatios[activeView]}% glazing`, offX, offY - 8)
  }, [activeView, glassN, glassS, glassE, glassW, winH, winW, winSpacing, floors, totalH, state])

  return (
    <div className="step-wrap" style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <h1 className="step-title">Facade <em>design.</em></h1>
        <span className="tag">Step 05</span>
      </div>
      <p className="step-sub">Configure glazing ratios, window dimensions and material selection. Cost and energy estimates update in real time.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Facade preview */}
        <div>
          <div className="section-head"><span className="section-label">Facade elevation preview</span><div className="section-line" /></div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['S','N','E','W'].map(f => (
              <button key={f} className={`face-tab ${activeView === f ? 'active' : ''}`} onClick={() => setActiveView(f)}>
                {f} face
              </button>
            ))}
          </div>
          <div className="canvas-facade-wrap">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="section-head"><span className="section-label">Glazing ratios by facade</span><div className="section-line" /></div>
          <div className="card-dark" style={{ marginBottom: 14 }}>
            {[
              { face: 'South', val: glassS, set: setGlassS, rec: 55, color: '#f59e0b' },
              { face: 'North', val: glassN, set: setGlassN, rec: 30, color: '#3b82f6' },
              { face: 'East', val: glassE, set: setGlassE, rec: 45, color: '#10b981' },
              { face: 'West', val: glassW, set: setGlassW, rec: 35, color: '#8b5cf6' },
            ].map(f => (
              <div key={f.face} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.face}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>rec {f.rec}%</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', minWidth: 36, textAlign: 'right' }}>{f.val}%</span>
                  </div>
                </div>
                <input type="range" min="10" max="90" value={f.val}
                  onChange={e => f.set(+e.target.value)}
                  style={{ '--accent-color': f.color, accentColor: f.color, width: '100%' }} />
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Window dimensions</span><div className="section-line" /></div>
          <div className="card-dark" style={{ marginBottom: 14 }}>
            {[
              { l: 'Window height (ft)', v: winH, set: setWinH, min: 3, max: 12, step: 0.5 },
              { l: 'Window width (ft)', v: winW, set: setWinW, min: 2, max: 10, step: 0.5 },
              { l: 'Mullion spacing (ft)', v: winSpacing, set: setWinSpacing, min: 1, max: 6, step: 0.5 },
            ].map(s => (
              <div key={s.l} className="slider-row" style={{ marginBottom: 10 }}>
                <span className="slider-label" style={{ minWidth: 140 }}>{s.l}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.v} onChange={e => s.set(+e.target.value)} />
                <span className="slider-val">{s.v} ft</span>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Material selection</span><div className="section-line" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>GLAZING TYPE</div>
              {Object.entries({ standard: 'Standard IGU', highPerf: 'High-perf Low-E', triple: 'Triple Glazed', electrochromic: 'Electrochromic' }).map(([k, l]) => (
                <div key={k} className={`mat-opt ${glassType === k ? 'active' : ''}`} onClick={() => setGlassType(k)}>
                  <span style={{ fontSize: 11 }}>{l}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>${GLASS_COST_PSF[k]}/sf</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>WALL PANEL</div>
              {Object.entries({ concrete: 'Precast Concrete', metalPanel: 'Metal Panel', terracotta: 'Terracotta', stone: 'Stone Cladding' }).map(([k, l]) => (
                <div key={k} className={`mat-opt ${wallType === k ? 'active' : ''}`} onClick={() => setWallType(k)}>
                  <span style={{ fontSize: 11 }}>{l}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>${WALL_COST_PSF[k]}/sf</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div>
          <div className="section-head"><span className="section-label">Cost estimate</span><div className="section-line" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="metric-chip">
              <div className="metric-chip-label">Total facade cost</div>
              <div className="metric-chip-val" style={{ fontSize: 22 }}>${(totalFacadeCost / 1e6).toFixed(1)}M</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-label">Glazing only</div>
              <div className="metric-chip-val">${(glassCost / 1e6).toFixed(1)}M</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-label">Wall cladding</div>
              <div className="metric-chip-val">${(wallCost / 1e6).toFixed(1)}M</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-label">Cost / sf facade</div>
              <div className="metric-chip-val">${Math.round(totalFacadeCost / (totalGlassArea + totalWallArea))}/sf</div>
            </div>

            <div className="section-head" style={{ marginTop: 8 }}><span className="section-label">Energy model</span><div className="section-line" /></div>
            <div className="metric-chip">
              <div className="metric-chip-label">Est. annual energy</div>
              <div className="metric-chip-val warn">${(annualEnergyCost / 1000).toFixed(0)}K /yr</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-label">Saving vs baseline</div>
              <div className="metric-chip-val good">–${(energySaving / 1000).toFixed(0)}K /yr</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-label">Avg glazing ratio</div>
              <div className="metric-chip-val">{Math.round(avgGlassRatio)}%</div>
            </div>

            {/* Glass area breakdown */}
            <div className="section-head" style={{ marginTop: 4 }}><span className="section-label">Glazing by face</span><div className="section-line" /></div>
            {Object.entries(facadeAreas).map(([face, a]) => (
              <div key={face} style={{ background: 'var(--bg-panel)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{face} face</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{Math.round(a.glass).toLocaleString()} sf glass</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: glassRatios[face] + '%', background: face === 'S' ? 'var(--gold)' : 'var(--accent-bright)' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn-ghost" onClick={onBack} style={{ flex: 1 }}>← Back</button>
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Export study →
          </button>
        </div>
      </div>
    </div>
  )
}
