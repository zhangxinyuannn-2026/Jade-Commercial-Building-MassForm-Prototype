import React, { useState, useRef, useEffect } from 'react'
import './Step5Facade.css'

// Industry-standard facade cost data ($/sf installed, US 2024)
const GLASS_COST = { standard:28, highPerf:55, triple:95, electrochromic:180 }
const WALL_COST  = { concrete:22, metalPanel:32, terracotta:38, stone:65 }
// U-values (BTU/hr·ft²·°F) — lower = better insulation
const GLASS_UVAL = { standard:0.48, highPerf:0.27, triple:0.15, electrochromic:0.22 }
// SHGC (solar heat gain coefficient)
const GLASS_SHGC = { standard:0.40, highPerf:0.25, triple:0.20, electrochromic:0.10 }

export default function Step5Facade({ state, update, onNext, onBack }) {
  const [glassN, setGlassN] = useState(state.glassRatioN ? Math.round(state.glassRatioN*100) : 30)
  const [glassS, setGlassS] = useState(state.glassRatioS ? Math.round(state.glassRatioS*100) : 55)
  const [glassE, setGlassE] = useState(state.glassRatioE ? Math.round(state.glassRatioE*100) : 45)
  const [glassW, setGlassW] = useState(state.glassRatioW ? Math.round(state.glassRatioW*100) : 35)
  const [winH,   setWinH]   = useState(state.windowHeight   || 7)
  const [winW,   setWinW]   = useState(state.windowWidth    || 5)
  const [winSpacing, setWinSpacing] = useState(state.windowSpacing || 3)
  const [glassType, setGlassType]   = useState(state.glassType || 'highPerf')
  const [wallType,  setWallType]    = useState(state.wallType  || 'metalPanel')
  const [activeView, setActiveView] = useState('S')
  const canvasRef = useRef(null)

  // Derive building geometry from state
  const programs  = state.selectedPrograms || []
  const totalSF   = programs.reduce((s,p) => s+(p.sf||0), 0) || 50000
  const envW      = (state.lotW||120) - (state.sideSB||10)*2
  const envD      = (state.lotD||160) - (state.frontSB||15) - (state.rearSB||20)
  const floorH    = 14
  const floors    = Math.max(1, Math.round(totalSF / (envW * envD)))
  const totalH    = floors * floorH
  const facadeWid = { N:envW, S:envW, E:envD, W:envD }
  const glassRatios = { N:glassN, S:glassS, E:glassE, W:glassW }

  // ── COST MODEL (correlated to programme + facade choices) ─────────────────
  // Facade area per face
  const facadeAreas = {}
  let totalGlassArea = 0, totalWallArea = 0
  Object.entries(facadeWid).forEach(([face, w]) => {
    const tot  = w * totalH
    const gl   = tot * glassRatios[face] / 100
    const wl   = tot - gl
    facadeAreas[face] = { total:tot, glass:gl, wall:wl }
    totalGlassArea += gl
    totalWallArea  += wl
  })
  const glassCost      = Math.round(totalGlassArea * GLASS_COST[glassType])
  const wallCost       = Math.round(totalWallArea  * WALL_COST[wallType])
  const totalFacadeCost = glassCost + wallCost

  // Energy model — ASHRAE 90.1 simplified
  // Heating degree-days NYC ≈ 4800, cooling ≈ 1400
  const uVal  = GLASS_UVAL[glassType]
  const shgc  = GLASS_SHGC[glassType]
  const avgGlRatio = (glassN+glassS+glassE+glassW)/4/100

  // Conduction loss through glass (W/m²K → BTU/hr·ft²·°F already)
  const conductionLoss = totalGlassArea * uVal * 4800 * 24 / 1000000 // MMBTU/yr
  // Solar gain (summer cooling)
  const solarGain = totalGlassArea * shgc * 250 * (glassS+glassW*1.2+glassE*0.7+glassN*0.2)/4/100 * 0.001 // MMBTU/yr
  // Base energy: ~$4.50/sf/yr for commercial office
  const baseEnergy = totalSF * 4.50
  // Adjustment: better glazing = lower load
  const glassMultiplier = 0.70 + (avgGlRatio * 0.5) + ((uVal - 0.15) * 0.3)
  const annualEnergyCost = Math.round(baseEnergy * Math.min(1.4, Math.max(0.7, glassMultiplier)))
  const baselineEnergy   = Math.round(baseEnergy * 1.1) // standard IGU baseline
  const annualSaving     = Math.max(0, baselineEnergy - annualEnergyCost)
  const payback          = annualSaving > 0
    ? Math.round((glassCost - totalGlassArea * GLASS_COST['standard']) / annualSaving)
    : '—'

  // Programme mix premium: if >30% amenity/retail → higher specification expected
  const amenitySF = programs.filter(p=>['retail','amenity','rooftop'].includes(p.category)||['storefront','rooftop-lounge','showroom'].includes(p.id)).reduce((s,p)=>s+(p.sf||0),0)
  const amenityPremiumPct = totalSF > 0 ? Math.round(amenitySF/totalSF*100) : 0

  // Save to state on any change
  useEffect(() => {
    update({
      glassRatioN:glassN/100, glassRatioS:glassS/100,
      glassRatioE:glassE/100, glassRatioW:glassW/100,
      windowHeight:winH, windowWidth:winW, windowSpacing:winSpacing,
      glassType, wallType,
      // Store computed costs for Step5 Solar to read
      facadeCostTotal:totalFacadeCost, facadeCostGlass:glassCost,
      facadeCostWall:wallCost, annualEnergyCost, annualEnergySaving:annualSaving,
      facadeTotalGlassArea:totalGlassArea, facadeTotalWallArea:totalWallArea,
    })
  }, [glassN,glassS,glassE,glassW,winH,winW,winSpacing,glassType,wallType])

  // ── FACADE ELEVATION CANVAS ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 2
    const rect = canvas.getBoundingClientRect()
    const W = rect.width || 360, H = rect.height || 360
    canvas.width  = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const PAD = 10
    const fw = facadeWid[activeView], fh = totalH
    const scX = Math.min((W-PAD*2) / fw, (H-PAD*2) / fh)
    const dW = fw * scX, dH = fh * scX
    const offX = (W - dW) / 2, offY = H - PAD - dH

    const gr = glassRatios[activeView] / 100
    const progColors = programs.map(p => p.color || '#3b82f6')

    // Wall background — colour by programme bands
    if (programs.length > 0) {
      let yOff = dH
      programs.forEach((prog, i) => {
        const progH = (prog.floorH || 14) / fh * dH
        yOff -= progH
        const col = prog.color || '#c8d8e8'
        ctx.fillStyle = col + '40'
        ctx.fillRect(offX, offY + yOff, dW, progH)
      })
    } else {
      ctx.fillStyle = '#c4d8e8'; ctx.fillRect(offX, offY, dW, dH)
    }

    // Window grid
    const wW = winW * scX, wH = winH * scX, gutter = winSpacing * scX
    const cols = Math.max(1, Math.floor((dW + gutter) / (wW + gutter)))
    const totalWW = cols * wW + (cols - 1) * gutter
    const pOffX = offX + (dW - totalWW) / 2
    const floorPx = floorH * scX
    const floorCount = Math.min(floors, 60)

    for (let row = 0; row < floorCount; row++) {
      const fy = offY + dH - (row + 1) * floorPx // bottom-up
      ctx.strokeStyle = 'rgba(44,74,53,0.12)'; ctx.lineWidth = 0.4
      ctx.beginPath(); ctx.moveTo(offX, fy + floorPx); ctx.lineTo(offX + dW, fy + floorPx); ctx.stroke()

      for (let col = 0; col < cols; col++) {
        if (Math.random() > gr * 1.15) continue
        const wx = pOffX + col * (wW + gutter)
        const wy = fy + (floorPx - wH) / 2
        const grad = ctx.createLinearGradient(wx, wy, wx + wW, wy + wH)
        grad.addColorStop(0, 'rgba(175,210,238,0.88)')
        grad.addColorStop(0.45, 'rgba(215,235,250,0.75)')
        grad.addColorStop(1, 'rgba(130,185,225,0.82)')
        ctx.fillStyle = grad; ctx.fillRect(wx, wy, wW, wH)
        ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.fillRect(wx+1, wy+1, wW*0.28, wH*0.52)
        ctx.strokeStyle = 'rgba(44,74,53,0.22)'; ctx.lineWidth = 0.5; ctx.strokeRect(wx, wy, wW, wH)
      }
    }

    // Outline
    ctx.strokeStyle = 'rgba(44,74,53,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(offX, offY, dW, dH)

    // Label
    ctx.fillStyle = 'rgba(44,74,53,0.6)'; ctx.font = '10px DM Mono, monospace'; ctx.textAlign = 'left'
    ctx.fillText(`${activeView}-face  ${glassRatios[activeView]}% glazing  ${Math.round(fw)}×${Math.round(totalH)}ft`, offX, offY - 6)

    // Ground
    ctx.fillStyle = '#8aaa88'; ctx.fillRect(offX - 8, offY + dH, dW + 16, 3)
  }, [activeView, glassN, glassS, glassE, glassW, winH, winW, winSpacing, floors, totalH, programs, state])

  return (
    <div className="step-wrap" style={{ maxWidth:1100 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
        <h1 className="step-title">Facade <em>design.</em></h1>
        <span className="tag">Step 04</span>
      </div>
      <p className="step-sub">Configure glazing ratios, window dimensions and materials. All costs and energy figures are calculated from your programme and building geometry.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 270px', gap:20, alignItems:'start' }}>
        {/* Preview */}
        <div>
          <div className="section-head"><span className="section-label">Facade elevation — {state.projectName||'Study'}</span><div className="section-line"/></div>
          <div style={{ display:'flex', gap:5, marginBottom:8, flexWrap:'wrap' }}>
            {['S','N','E','W'].map(f => (
              <button key={f} className={`face-tab ${activeView===f?'active':''}`} onClick={()=>setActiveView(f)}>{f} face</button>
            ))}
          </div>
          <div className="canvas-facade-wrap">
            <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
          </div>
          {/* Programme breakdown reminder */}
          {programs.length > 0 && (
            <div style={{ marginTop:10, padding:'8px 10px', background:'var(--bg-white)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:9, fontFamily:'var(--font-mono)', color:'var(--ink-dim)', letterSpacing:'0.08em', marginBottom:5 }}>PROGRAMME MIX (affects spec)</div>
              <div style={{ display:'flex', height:8, borderRadius:3, overflow:'hidden', marginBottom:5 }}>
                {programs.map(p => <div key={p.id} style={{ flex:p.sf||0, background:p.color, minWidth:2 }} />)}
              </div>
              {amenityPremiumPct > 25 && (
                <div style={{ fontSize:10, color:'var(--gold)' }}>
                  ✦ {amenityPremiumPct}% amenity / retail — premium specification recommended
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div>
          <div className="section-head"><span className="section-label">Glazing ratio by facade</span><div className="section-line"/></div>
          <div className="card-white" style={{ marginBottom:14 }}>
            {[
              {face:'South (S)',val:glassS,set:setGlassS,rec:55,note:'Max solar gain — overhang req.'},
              {face:'North (N)', val:glassN,set:setGlassN,rec:30,note:'Diffuse only — min heat loss'},
              {face:'East (E)',  val:glassE,set:setGlassE,rec:45,note:'Morning light — vertical fins'},
              {face:'West (W)',  val:glassW,set:setGlassW,rec:35,note:'Limit afternoon heat gain'},
            ].map(f => (
              <div key={f.face} style={{ marginBottom:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'var(--ink-mid)' }}>{f.face}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:9, color:'var(--ink-ghost)', fontFamily:'var(--font-mono)' }}>rec {f.rec}%</span>
                    <span style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--ink)', minWidth:32, textAlign:'right' }}>{f.val}%</span>
                  </div>
                </div>
                <input type="range" min="10" max="90" value={f.val} onChange={e => f.set(+e.target.value)} style={{ width:'100%' }} />
                <div style={{ fontSize:9, color:'var(--ink-ghost)', marginTop:2 }}>{f.note}</div>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Window dimensions</span><div className="section-line"/></div>
          <div className="card-white" style={{ marginBottom:14 }}>
            {[
              {l:'Window height (ft)', v:winH, set:setWinH, min:3,  max:13, step:0.5, note:'Max '+(Math.round((state.heightMax||180)/floors/14*100)/100*14).toFixed(1)+'ft (floor-to-floor)'},
              {l:'Window width (ft)',  v:winW, set:setWinW, min:2,  max:12, step:0.5, note:'Varies with structural bay spacing'},
              {l:'Mullion spacing (ft)',v:winSpacing,set:setWinSpacing,min:1,max:6,step:0.5,note:'Structural grid module'},
            ].map(s => (
              <div key={s.l} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, color:'var(--ink-mid)' }}>{s.l}</span>
                  <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--ink)' }}>{s.v} ft</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.v} onChange={e => s.set(+e.target.value)} style={{ width:'100%' }} />
                <div style={{ fontSize:9, color:'var(--ink-ghost)', marginTop:2 }}>{s.note}</div>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Material selection</span><div className="section-line"/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:9, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', marginBottom:6, letterSpacing:'0.1em' }}>GLAZING SYSTEM</div>
              {[
                ['standard',    'Standard IGU',     `U=${GLASS_UVAL.standard}  SHGC=${GLASS_SHGC.standard}`],
                ['highPerf',    'High-perf Low-E',  `U=${GLASS_UVAL.highPerf}  SHGC=${GLASS_SHGC.highPerf}`],
                ['triple',      'Triple Glazed',     `U=${GLASS_UVAL.triple}  SHGC=${GLASS_SHGC.triple}`],
                ['electrochromic','Electrochromic',  `U=${GLASS_UVAL.electrochromic}  SHGC=${GLASS_SHGC.electrochromic}`],
              ].map(([k,l,spec]) => (
                <div key={k} className={`mat-opt ${glassType===k?'active':''}`} onClick={()=>setGlassType(k)}>
                  <div>
                    <div style={{ fontSize:11 }}>{l}</div>
                    <div style={{ fontSize:9, color:'var(--ink-ghost)', fontFamily:'var(--font-mono)' }}>{spec}</div>
                  </div>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--ink-dim)', flexShrink:0 }}>${GLASS_COST[k]}/sf</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:9, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', marginBottom:6, letterSpacing:'0.1em' }}>WALL CLADDING</div>
              {Object.entries({concrete:'Precast Concrete',metalPanel:'Metal Panel',terracotta:'Terracotta Rain Screen',stone:'Stone Cladding'}).map(([k,l])=>(
                <div key={k} className={`mat-opt ${wallType===k?'active':''}`} onClick={()=>setWallType(k)}>
                  <span style={{ fontSize:11 }}>{l}</span>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--ink-dim)' }}>${WALL_COST[k]}/sf</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div>
          <div className="section-head"><span className="section-label">Cost estimate</span><div className="section-line"/></div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            <div className="metric-chip"><div className="metric-chip-label">Total facade cost</div><div className="metric-chip-val" style={{fontSize:20}}>${(totalFacadeCost/1e6).toFixed(2)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Glazing ({Math.round(totalGlassArea).toLocaleString()} sf)</div><div className="metric-chip-val">${(glassCost/1e6).toFixed(2)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Wall cladding ({Math.round(totalWallArea).toLocaleString()} sf)</div><div className="metric-chip-val">${(wallCost/1e6).toFixed(2)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Avg cost / sf facade</div><div className="metric-chip-val">${Math.round(totalFacadeCost/((totalGlassArea+totalWallArea)||1))}/sf</div></div>
          </div>

          <div className="section-head"><span className="section-label">Energy model (ASHRAE 90.1)</span><div className="section-line"/></div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            <div className="metric-chip"><div className="metric-chip-label">Est. annual energy cost</div><div className="metric-chip-val warn">${(annualEnergyCost/1000).toFixed(0)}K / yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Saving vs standard IGU</div><div className="metric-chip-val good">–${(annualSaving/1000).toFixed(0)}K / yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Payback period</div><div className="metric-chip-val">{payback}{typeof payback==='number'?' yrs':''}</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Avg glazing ratio</div><div className="metric-chip-val">{Math.round((glassN+glassS+glassE+glassW)/4)}%</div></div>
          </div>

          <div className="section-head"><span className="section-label">Glass area by face</span><div className="section-line"/></div>
          {Object.entries(facadeAreas).map(([face,a]) => (
            <div key={face} style={{ background:'var(--bg-white)', borderRadius:6, padding:'8px 10px', border:'1px solid var(--border)', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:11, color:'var(--ink-mid)' }}>{face} face — {glassRatios[face]}%</span>
                <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--ink)' }}>{Math.round(a.glass).toLocaleString()} sf</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:glassRatios[face]+'%', background:face==='S'?'var(--gold)':face==='W'?'var(--red)':'var(--accent)' }} />
              </div>
            </div>
          ))}

          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <button className="btn-ghost" onClick={onBack} style={{ flex:1 }}>← Back</button>
            <button className="btn-primary" onClick={onNext} style={{ flex:1 }}>Solar & ESG →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
