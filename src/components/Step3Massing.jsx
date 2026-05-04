import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CIRCULATION_TYPES, ELEVATOR_CONFIGS } from '../data/programs.js'
import './Step3Massing.css'

const MASSING_TYPES = [
  { id: 'box', label: 'Box', icon: '▬' },
  { id: 'taper', label: 'Taper', icon: '▲' },
  { id: 'step', label: 'Stepped', icon: '⊏' },
  { id: 'solar', label: 'Solar-cut', icon: '◈' },
  { id: 'podium', label: 'Podium+Tower', icon: '⊓' },
]

const SCALE = 0.06

function getSunAlt(h, m) {
  const dec = 23.45 * Math.sin((360 / 365 * (284 + m * 30.5 - 15)) * Math.PI / 180)
  const lat = 40.7
  const ha = (h - 12) * 15
  const sinAlt = Math.sin(lat * Math.PI / 180) * Math.sin(dec * Math.PI / 180) +
    Math.cos(lat * Math.PI / 180) * Math.cos(dec * Math.PI / 180) * Math.cos(ha * Math.PI / 180)
  return Math.asin(sinAlt) * 180 / Math.PI
}

export default function Step3Massing({ state, update, onNext, onBack }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef({})
  const [massingType, setMassingType] = useState(state.massingType || 'box')
  const [taperPct, setTaperPct] = useState(state.taperPct || 0.6)
  const [stepCount, setStepCount] = useState(state.stepCount || 3)
  const [podiumFloors, setPodiumFloors] = useState(3)
  const [sunShow, setSunShow] = useState(false)
  const [sunHour, setSunHour] = useState(12)
  const [sunMonth, setSunMonth] = useState(6)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const programs = state.selectedPrograms || []
  const totalSF = programs.reduce((s, p) => s + (p.sf || p.defaultSF || 0), 0)
  const maxGFA = (state.lotW || 120) * (state.lotD || 160) * (state.farMax || 8)
  const farUsed = (totalSF / ((state.lotW || 120) * (state.lotD || 160))).toFixed(2)
  const floors = Math.max(1, Math.round(totalSF / (((state.lotW || 120) - (state.sideSB || 10) * 2) * ((state.lotD || 160) - (state.frontSB || 15) - (state.rearSB || 20)))))
  const totalH = floors * 14
  const circirc = CIRCULATION_TYPES.find(c => c.id === state.circulationType)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const wrap = canvas.parentElement
    const W = wrap.clientWidth, H = wrap.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x050c18, 1)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050c18, 0.012)

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 600)
    camera.position.set(22, 18, 28)
    camera.lookAt(0, 6, 0)

    // Lights
    scene.add(new THREE.AmbientLight(0x8ba3c9, 0.5))
    const sun = new THREE.DirectionalLight(0xfff0d0, 1.4)
    sun.position.set(15, 30, 15)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x304060, 0.4)
    fill.position.set(-10, 5, -10)
    scene.add(fill)

    // Ground
    const gndGeo = new THREE.PlaneGeometry(100, 100)
    const gndMat = new THREE.MeshLambertMaterial({ color: 0x0a1520 })
    const gnd = new THREE.Mesh(gndGeo, gndMat)
    gnd.rotation.x = -Math.PI / 2
    gnd.receiveShadow = true
    scene.add(gnd)
    scene.add(new THREE.GridHelper(100, 50, 0x152030, 0x0d1a28))

    const buildingGroup = new THREE.Group()
    const envelopeGroup = new THREE.Group()
    const shadowGroup = new THREE.Group()
    const sunGroup = new THREE.Group()
    scene.add(envelopeGroup, buildingGroup, shadowGroup, sunGroup)

    sceneRef.current = { renderer, scene, camera, buildingGroup, envelopeGroup, shadowGroup, sunGroup, sun }

    // Orbit
    let drag = false, lx = 0, ly = 0, theta = 0.6, phi = 0.55, radius = 36
    canvas.addEventListener('mousedown', e => { drag = true; lx = e.clientX; ly = e.clientY })
    window.addEventListener('mouseup', () => { drag = false })
    window.addEventListener('mousemove', e => {
      if (!drag) return
      theta -= (e.clientX - lx) * 0.007
      phi = Math.max(0.08, Math.min(1.5, phi - (e.clientY - ly) * 0.007))
      lx = e.clientX; ly = e.clientY
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      )
      camera.lookAt(0, 6, 0)
    })
    canvas.addEventListener('wheel', e => {
      radius = Math.max(10, Math.min(80, radius + e.deltaY * 0.05))
      camera.position.setLength(radius)
    })

    const handleResize = () => {
      const W2 = wrap.clientWidth, H2 = wrap.clientHeight
      renderer.setSize(W2, H2)
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  // Rebuild scene when params change
  useEffect(() => {
    const { buildingGroup, envelopeGroup, shadowGroup } = sceneRef.current
    if (!buildingGroup) return

    const clearGroup = g => { while (g.children.length) g.remove(g.children[0]) }
    clearGroup(buildingGroup)
    clearGroup(envelopeGroup)
    clearGroup(shadowGroup)

    const lw = (state.lotW || 120) * SCALE
    const ld = (state.lotD || 160) * SCALE
    const sbf = (state.frontSB || 15) * SCALE
    const sbs = (state.sideSB || 10) * SCALE
    const sbr = (state.rearSB || 20) * SCALE
    const ew = lw - sbs * 2
    const ed = ld - sbf - sbr
    const hMax = (state.heightMax || 180) * SCALE
    const cy = (sbf - sbr) / 2

    // Lot
    const lotEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(lw, 0.01, ld)),
      new THREE.LineBasicMaterial({ color: 0x1a2f50 }))
    lotEdge.position.y = 0.005
    envelopeGroup.add(lotEdge)

    // Setback
    const sbEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew, 0.01, ed)),
      new THREE.LineBasicMaterial({ color: 0x1a5a3a }))
    sbEdge.position.set(0, 0.01, cy)
    envelopeGroup.add(sbEdge)

    // Envelope ghost
    const envMesh = new THREE.Mesh(
      new THREE.BoxGeometry(ew, hMax, ed),
      new THREE.MeshBasicMaterial({ color: 0x1a3a5a, transparent: true, opacity: 0.05 })
    )
    envMesh.position.set(0, hMax / 2, cy)
    envelopeGroup.add(envMesh)
    const envWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew, hMax, ed)),
      new THREE.LineBasicMaterial({ color: 0x1a5aaa, transparent: true, opacity: 0.18 }))
    envWire.position.copy(envMesh.position)
    envelopeGroup.add(envWire)

    // Build program stacks
    const progs = programs.length > 0 ? programs : [{ label: 'Office', color: '#3b82f6', sf: totalSF || 5000, floorH: 14 }]
    let yOffset = 0

    progs.forEach((prog, i) => {
      const progH = (prog.floorH || 13) * SCALE
      let fw = ew, fd = ed
      const t = i / Math.max(progs.length - 1, 1)

      if (massingType === 'taper') {
        const factor = 1 - (1 - taperPct) * t
        fw = ew * factor; fd = ed * factor
      } else if (massingType === 'step') {
        const tier = Math.floor(i / Math.ceil(progs.length / stepCount))
        const shrink = Math.max(0.35, 1 - tier * (0.65 / Math.max(stepCount - 1, 1)))
        fw = ew * shrink; fd = ed * shrink
      } else if (massingType === 'solar') {
        const cut = Math.max(0, t - 0.35) * 1.5
        fw = ew * Math.max(0.4, 1 - cut * 0.4)
      } else if (massingType === 'podium') {
        if (i < podiumFloors) { fw = ew; fd = ed }
        else { fw = ew * 0.55; fd = ed * 0.7 }
      }

      const col = new THREE.Color(prog.color || '#3b82f6')
      col.multiplyScalar(0.55 + 0.45 * (1 - t * 0.4))
      const geo = new THREE.BoxGeometry(fw, progH * 0.97, fd)
      const mat = new THREE.MeshLambertMaterial({ color: col })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, yOffset + progH / 2, cy)
      mesh.castShadow = true; mesh.receiveShadow = true
      buildingGroup.add(mesh)

      const wireGeo = new THREE.EdgesGeometry(geo)
      const wire = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 }))
      wire.position.copy(mesh.position)
      buildingGroup.add(wire)

      yOffset += progH
    })

    // Shadow
    if (sunShow) {
      const alt = getSunAlt(sunHour, sunMonth)
      if (alt > 2) {
        const az = (sunHour - 6) / 14 * Math.PI
        const shadowLen = (yOffset) / Math.tan(alt * Math.PI / 180)
        const sx = Math.sin(az) * shadowLen, sz = Math.cos(az) * shadowLen
        const sGeo = new THREE.PlaneGeometry(ew + Math.abs(sx) * 0.3 + 0.5, ed + Math.abs(sz) * 0.3 + 0.5)
        const sMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })
        const sMesh = new THREE.Mesh(sGeo, sMat)
        sMesh.rotation.x = -Math.PI / 2
        sMesh.position.set(sx * 0.5, 0.02, cy + sz * 0.5)
        shadowGroup.add(sMesh)
      }
    }
  }, [programs, massingType, taperPct, stepCount, podiumFloors, sunShow, sunHour, sunMonth, state])

  const setView = (v) => {
    const { camera } = sceneRef.current
    if (!camera) return
    if (v === 'top') { camera.position.set(0, 50, 0.01); camera.lookAt(0, 0, 0) }
    else if (v === 'south') { camera.position.set(0, 14, 38); camera.lookAt(0, 10, 0) }
    else if (v === 'iso') { camera.position.set(22, 18, 28); camera.lookAt(0, 6, 0) }
  }

  return (
    <div className="step-full">
      <div className="canvas-area">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Toolbar */}
        <div className="canvas-toolbar">
          <button className="tool-btn" onClick={() => setView('iso')}>Isometric</button>
          <button className="tool-btn" onClick={() => setView('top')}>Top</button>
          <button className="tool-btn" onClick={() => setView('south')}>South</button>
          <button className={`tool-btn ${sunShow ? 'sun-on' : ''}`} onClick={() => setSunShow(v => !v)}>
            ☀ Sun
          </button>
        </div>

        {/* Sun controls */}
        {sunShow && (
          <div className="sun-panel">
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 10 }}>SUN ANALYSIS</div>
            <div className="slider-row" style={{ marginBottom: 8 }}>
              <span className="slider-label">Hour</span>
              <input type="range" min="6" max="20" value={sunHour} onChange={e => setSunHour(+e.target.value)} />
              <span className="slider-val">{sunHour}:00</span>
            </div>
            <div className="slider-row" style={{ marginBottom: 10 }}>
              <span className="slider-label">Month</span>
              <input type="range" min="1" max="12" value={sunMonth} onChange={e => setSunMonth(+e.target.value)} />
              <span className="slider-val">{MONTHS[sunMonth - 1]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { l: 'Altitude', v: Math.max(0, getSunAlt(sunHour, sunMonth)).toFixed(0) + '°' },
                { l: 'Shadow (ft)', v: getSunAlt(sunHour, sunMonth) > 0 ? Math.round(totalH / Math.tan(getSunAlt(sunHour, sunMonth) * Math.PI / 180)) + ' ft' : '∞' },
              ].map(x => (
                <div key={x.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{x.l}</div>
                  <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="canvas-info">
          <span>{state.projectName}</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span>{Math.round(totalH)} ft · {programs.length} programs</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: farUsed > state.farMax ? 'var(--red)' : 'var(--green)' }}>FAR {farUsed}</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="side-pane">
        {/* Metrics */}
        <div className="card-dark">
          <div className="section-label" style={{ marginBottom: 10 }}>Area schedule</div>
          {[
            { l: 'Total GFA', v: totalSF.toLocaleString() + ' sf', cls: totalSF > maxGFA ? 'bad' : 'good' },
            { l: 'FAR used', v: farUsed + ' / ' + state.farMax, cls: farUsed > state.farMax ? 'bad' : '' },
            { l: 'Est. floors', v: floors },
            { l: 'Total height', v: Math.round(totalH) + ' ft' },
          ].map(m => (
            <div key={m.l} className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.l}</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: m.cls === 'good' ? 'var(--green)' : m.cls === 'bad' ? 'var(--red)' : 'var(--text-primary)' }}>{m.v}</span>
            </div>
          ))}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: Math.min(100, totalSF / maxGFA * 100) + '%', background: 'var(--accent-bright)' }} />
          </div>
        </div>

        {/* Massing type */}
        <div>
          <div className="section-head"><span className="section-label">Massing type</span><div className="section-line" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            {MASSING_TYPES.map(mt => (
              <div key={mt.id}
                className={`massing-opt ${massingType === mt.id ? 'active' : ''}`}
                onClick={() => { setMassingType(mt.id); update({ massingType: mt.id }) }}>
                <span style={{ fontSize: 16 }}>{mt.icon}</span>
                <span style={{ fontSize: 11 }}>{mt.label}</span>
              </div>
            ))}
          </div>

          {massingType === 'taper' && (
            <div className="slider-row">
              <span className="slider-label">Top width %</span>
              <input type="range" min="10" max="100" value={Math.round(taperPct * 100)}
                onChange={e => { setTaperPct(e.target.value / 100); update({ taperPct: e.target.value / 100 }) }} />
              <span className="slider-val">{Math.round(taperPct * 100)}%</span>
            </div>
          )}
          {massingType === 'step' && (
            <div className="slider-row">
              <span className="slider-label">Steps</span>
              <input type="range" min="2" max="6" step="1" value={stepCount}
                onChange={e => { setStepCount(+e.target.value); update({ stepCount: +e.target.value }) }} />
              <span className="slider-val">{stepCount}</span>
            </div>
          )}
          {massingType === 'podium' && (
            <div className="slider-row">
              <span className="slider-label">Podium flrs</span>
              <input type="range" min="1" max="6" step="1" value={podiumFloors}
                onChange={e => setPodiumFloors(+e.target.value)} />
              <span className="slider-val">{podiumFloors}</span>
            </div>
          )}
        </div>

        {/* Program stack */}
        <div>
          <div className="section-head"><span className="section-label">Program stack</span><div className="section-line" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {programs.map((prog, i) => (
              <div key={prog.id} className="prog-stack-row" style={{ borderLeft: `3px solid ${prog.color}` }}>
                <span style={{ fontSize: 11, flex: 1 }}>{prog.label}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {(prog.sf || prog.defaultSF || 0).toLocaleString()} sf
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{prog.floorH}ft</span>
              </div>
            ))}
          </div>
        </div>

        {/* Circulation summary */}
        {circirc && (
          <div className="card-dark">
            <div className="section-label" style={{ marginBottom: 6 }}>Circulation</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>{circirc.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Efficiency: {Math.round(circirc.efficiencyRatio * 100)}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Net area: {Math.round(totalSF * circirc.efficiencyRatio).toLocaleString()} sf</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button className="btn-ghost" onClick={onBack} style={{ flex: 1 }}>← Back</button>
          <button className="btn-primary" onClick={onNext} style={{ flex: 2 }}>Solar Analysis →</button>
        </div>
      </div>
    </div>
  )
}
