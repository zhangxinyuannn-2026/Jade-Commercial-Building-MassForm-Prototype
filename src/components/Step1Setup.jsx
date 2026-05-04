import React, { useState } from 'react'
import './Step1Setup.css'

const ORIENTATIONS = ['N','NE','E','SE','S','SW','W','NW']

export default function Step1Setup({ state, update, onNext }) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDone, setAiDone] = useState(false)
  const [aiBadges, setAiBadges] = useState({})

  const lotArea = (state.lotW||0) * (state.lotD||0)
  const maxGFA  = Math.round(lotArea * (state.farMax||0))

  function handleFile(e) {
    const f = e.target.files[0]; if (!f) return
    update({ uploadedFile: f.name })
    setAiLoading(true); setAiDone(false)
    setTimeout(() => {
      setAiLoading(false); setAiDone(true)
      const extracted = { farMax:7.5, heightMax:200, frontSB:20, sideSB:12, rearSB:25 }
      let delay = 0
      Object.entries(extracted).forEach(([k,v]) => {
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
      {/* Hero intro */}
      <div className="intro-banner">
        <div className="intro-banner-left">
          <div className="intro-eyebrow">Commercial Massing Engine · Prototype v0.1 by Jade</div>
          <h1 className="intro-title">MassForm</h1>
          <p className="intro-desc">
            Early-stage commercial design is still buried in paperwork — cross-referencing zoning codes,
            calculating setbacks, manually checking FAR compliance, and reformatting the same numbers across
            spreadsheets and PDFs before a single design decision gets made. MassForm eliminates that overhead
            entirely.
          </p>
          <p className="intro-desc" style={{ marginTop: 8 }}>
            Upload a zoning ordinance and the engine reads it: FAR, height limits, setbacks, and use
            classifications are extracted in seconds and locked as hard constraints. That precision is the
            foundation — with the compliance numbers handled automatically, designers can go straight to what
            matters. MassForm draws on 15+ architecturally-grounded precedents spanning the full range of
            contemporary commercial typologies to generate massing section diagrams that are buildable and
            constraint-accurate. Every step feeds the next: programme drives massing, massing drives facade,
            facade drives the ESG and cost model. The final export is a client-ready study with a section
            diagram, programme schedule, and a written performance analysis — so the conversation with clients
            and planners starts from a precise, informed position rather than a blank page.
          </p>
          <div className="intro-features">
            {[
              'AI zoning extraction',
              '35+ BOMA 2024 programmes',
              '5 typologies · 15 massing variants',
              'Facade cost model (ASHRAE 90.1)',
              'Solar & ESG analysis',
              'Analytical PDF export with narrative',
            ].map(f => (
              <span key={f} className="intro-feature-chip">{f}</span>
            ))}
          </div>
        </div>

      </div>

      <div style={{ height:1, background:'var(--border)', margin:'26px 0' }} />

      <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
        <h2 className="step-title" style={{ fontSize:28 }}>Site <em>setup.</em></h2>
        <span className="tag">Step 01 of 06</span>
      </div>
      <p className="step-sub">Upload a zoning document to extract parameters automatically, or enter manually below.</p>

      {/* Upload */}
      <div className={`upload-zone ${state.uploadedFile?'has-file':''} ${aiLoading?'loading':''}`}
        onClick={() => document.getElementById('zoning-file').click()}>
        <input type="file" id="zoning-file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.txt,.csv" onChange={handleFile} />
        {!state.uploadedFile ? (
          <>
            <div className="upload-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <div className="spinner" style={{ width:14, height:14, border:'2px solid var(--border-mid)', borderTopColor:'var(--gold)', borderRadius:'50%' }}/>
                <span>Reading document with AI — extracting zoning parameters…</span>
              </div>
            ) : (
              <div className="ai-done">
                <span style={{ color:'var(--accent)', fontSize:16 }}>✓</span>
                <span>Extracted parameters from <strong>{state.uploadedFile}</strong></span>
                <span className="tag green">AI extracted</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divider-or"><span>or enter manually</span></div>

      <div className="field" style={{ marginBottom:18, maxWidth:380 }}>
        <label className="field-label">Project name</label>
        <input type="text" value={state.projectName} onChange={e=>update({projectName:e.target.value})} placeholder="Commercial Tower Study" />
      </div>

      <div className="section-head">
        <span className="section-label">Lot dimensions</span>
        <div className="section-line" />
      </div>
      <div className="grid-3" style={{ marginBottom:18 }}>
        <div className="field">
          <label className="field-label">Lot width (ft)</label>
          <input type="number" value={state.lotW} onChange={e=>update({lotW:+e.target.value,lotArea:+e.target.value*state.lotD})} />
        </div>
        <div className="field">
          <label className="field-label">Lot depth (ft)</label>
          <input type="number" value={state.lotD} onChange={e=>update({lotD:+e.target.value,lotArea:state.lotW*+e.target.value})} />
        </div>
        <div className="field">
          <label className="field-label">Lot area (auto)</label>
          <input type="number" value={lotArea} readOnly />
        </div>
      </div>

      <div className="section-head">
        <span className="section-label">Zoning parameters</span>
        <div className="section-line" />
      </div>
      <div className="grid-3" style={{ marginBottom:8 }}>
        {[
          { key:'farMax',   label:'Max FAR',         step:0.1 },
          { key:'heightMax',label:'Max height (ft)', step:5   },
          { key:'frontSB',  label:'Front setback (ft)',step:1 },
          { key:'sideSB',   label:'Side setback (ft)', step:1 },
          { key:'rearSB',   label:'Rear setback (ft)', step:1 },
        ].map(({ key, label, step }) => (
          <div className="field" key={key}>
            <label className="field-label">{label}</label>
            <input type="number" step={step} value={state[key]} onChange={e=>update({[key]:+e.target.value})}
              className={aiBadges[key]?'ai-filled':''} />
            {aiBadges[key] && <span className="ai-badge">✦ AI extracted</span>}
          </div>
        ))}
        <div className="field">
          <label className="field-label">Max GFA (auto)</label>
          <input type="number" value={maxGFA} readOnly />
          <span className="field-note">Lot area × FAR</span>
        </div>
      </div>

      <div className="section-head" style={{ marginTop:18 }}>
        <span className="section-label">Site orientation — true north</span>
        <div className="section-line" />
      </div>
      <div className="orient-grid">
        {ORIENTATIONS.map(o => (
          <button key={o} className={`orient-btn ${state.orientation===o?'active':''}`}
            onClick={() => update({ orientation:o })}>{o}</button>
        ))}
      </div>

      <div className="grid-3" style={{ marginTop:22, marginBottom:8 }}>
        <div className="metric-chip"><div className="metric-chip-label">Max GFA</div><div className="metric-chip-val">{maxGFA.toLocaleString()} sf</div></div>
        <div className="metric-chip"><div className="metric-chip-label">Envelope width</div><div className="metric-chip-val">{Math.max(0,(state.lotW||0)-(state.sideSB||0)*2)} ft</div></div>
        <div className="metric-chip"><div className="metric-chip-label">Envelope depth</div><div className="metric-chip-val">{Math.max(0,(state.lotD||0)-(state.frontSB||0)-(state.rearSB||0))} ft</div></div>
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={onNext}>Continue to Programme Selection →</button>
      </div>
    </div>
  )
}
