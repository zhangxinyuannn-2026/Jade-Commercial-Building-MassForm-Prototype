import React, { useState } from 'react'
import './Step1Setup.css'

const ORIENTATIONS = ['N','NE','E','SE','S','SW','W','NW']

export default function Step1Setup({ state, update, onNext }) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDone, setAiDone] = useState(false)
  const [aiBadges, setAiBadges] = useState({})

  const lotArea = (state.lotW || 0) * (state.lotD || 0)
  const maxGFA = Math.round(lotArea * (state.farMax || 0))

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    update({ uploadedFile: f.name })
    setAiLoading(true)
    setAiDone(false)
    // Simulate AI extraction (in production: send to Claude API)
    setTimeout(() => {
      setAiLoading(false)
      setAiDone(true)
      const extracted = { farMax: 7.5, heightMax: 200, frontSB: 20, sideSB: 12, rearSB: 25 }
      const badges = {}
      let delay = 0
      Object.entries(extracted).forEach(([k, v]) => {
        setTimeout(() => {
          update({ [k]: v })
          setAiBadges(b => ({ ...b, [k]: true }))
        }, delay += 200)
      })
      update({ aiExtracted: true })
    }, 2400)
  }

  return (
    <div className="step-wrap">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <h1 className="step-title">Define your <em>site.</em></h1>
        <span className="tag">Step 01</span>
      </div>
      <p className="step-sub">Upload a zoning document and MassForm will extract parameters automatically — or enter manually. All fields remain editable.</p>

      {/* Upload zone */}
      <div className={`upload-zone ${state.uploadedFile ? 'has-file' : ''} ${aiLoading ? 'loading' : ''}`}
        onClick={() => document.getElementById('zoning-file').click()}>
        <input type="file" id="zoning-file" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.csv" onChange={handleFile} />
        {!state.uploadedFile ? (
          <>
            <div className="upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <div className="upload-title">Drop zoning file here</div>
            <div className="upload-hint">PDF, DOC, TXT — planning codes, zoning ordinances, building regs</div>
          </>
        ) : (
          <div className="file-loaded">
            {aiLoading ? (
              <div className="ai-processing">
                <div className="spinner" style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%' }}/>
                <span>Reading document with Claude AI — extracting zoning parameters…</span>
              </div>
            ) : (
              <div className="ai-done">
                <span style={{ color: 'var(--green)', fontSize: 18 }}>✓</span>
                <span>Extracted parameters from <strong>{state.uploadedFile}</strong></span>
                <span className="tag green">AI extracted</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divider-or"><span>or enter manually</span></div>

      {/* Project name */}
      <div style={{ marginBottom: 20 }}>
        <div className="field">
          <label className="field-label">Project Name</label>
          <input type="text" value={state.projectName} onChange={e => update({ projectName: e.target.value })} placeholder="Commercial Tower Study" style={{ maxWidth: 400 }} />
        </div>
      </div>

      {/* Lot dimensions */}
      <div className="section-head">
        <span className="section-label">Lot dimensions</span>
        <div className="section-line" />
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="field">
          <label className="field-label">Lot width (ft)</label>
          <input type="number" value={state.lotW} onChange={e => update({ lotW: +e.target.value, lotArea: +e.target.value * state.lotD })} />
        </div>
        <div className="field">
          <label className="field-label">Lot depth (ft)</label>
          <input type="number" value={state.lotD} onChange={e => update({ lotD: +e.target.value, lotArea: state.lotW * +e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Lot area (auto)</label>
          <input type="number" value={lotArea} readOnly style={{ opacity: 0.6 }} />
        </div>
      </div>

      {/* Zoning */}
      <div className="section-head">
        <span className="section-label">Zoning parameters</span>
        <div className="section-line" />
      </div>
      <div className="grid-3" style={{ marginBottom: 8 }}>
        {[
          { key: 'farMax', label: 'Max FAR', step: 0.1 },
          { key: 'heightMax', label: 'Max height (ft)', step: 5 },
          { key: 'frontSB', label: 'Front setback (ft)', step: 1 },
          { key: 'sideSB', label: 'Side setback (ft)', step: 1 },
          { key: 'rearSB', label: 'Rear setback (ft)', step: 1 },
        ].map(({ key, label, step }) => (
          <div className="field" key={key}>
            <label className="field-label">{label}</label>
            <input type="number" step={step} value={state[key]} onChange={e => update({ [key]: +e.target.value })}
              className={aiBadges[key] ? 'ai-filled' : ''} />
            {aiBadges[key] && <span className="ai-badge">✦ AI extracted</span>}
          </div>
        ))}
        <div className="field">
          <label className="field-label">Max GFA (auto)</label>
          <input type="number" value={maxGFA} readOnly style={{ opacity: 0.6 }} />
          <span className="field-note">Lot area × FAR</span>
        </div>
      </div>

      {/* Orientation */}
      <div className="section-head" style={{ marginTop: 20 }}>
        <span className="section-label">Site orientation — north direction</span>
        <div className="section-line" />
      </div>
      <div className="orient-grid">
        {ORIENTATIONS.map(o => (
          <button key={o} className={`orient-btn ${state.orientation === o ? 'active' : ''}`}
            onClick={() => update({ orientation: o })}>{o}</button>
        ))}
      </div>

      {/* Summary chips */}
      <div className="grid-3" style={{ marginTop: 24, marginBottom: 8 }}>
        <div className="metric-chip">
          <div className="metric-chip-label">Max GFA</div>
          <div className="metric-chip-val">{maxGFA.toLocaleString()} sf</div>
        </div>
        <div className="metric-chip">
          <div className="metric-chip-label">Envelope width</div>
          <div className="metric-chip-val">{(state.lotW - state.sideSB * 2)} ft</div>
        </div>
        <div className="metric-chip">
          <div className="metric-chip-label">Envelope depth</div>
          <div className="metric-chip-val">{(state.lotD - state.frontSB - state.rearSB)} ft</div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={onNext}>
          Continue to Program Selection →
        </button>
      </div>
    </div>
  )
}
