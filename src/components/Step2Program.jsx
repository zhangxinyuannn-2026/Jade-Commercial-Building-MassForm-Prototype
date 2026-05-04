import React, { useState } from 'react'
import { PROGRAM_CATEGORIES, ALL_PROGRAMS, CIRCULATION_TYPES, ELEVATOR_CONFIGS, STAIR_CONFIGS } from '../data/programs.js'
import './Step2Program.css'

export default function Step2Program({ state, update, onNext, onBack }) {
  const [customLabel, setCustomLabel] = useState('')
  const [customColor, setCustomColor] = useState('#7c3aed')
  const [customSF, setCustomSF] = useState(500)
  const [customH, setCustomH] = useState(13)
  const [activeCategory, setActiveCategory] = useState('vertical')

  const selected = state.selectedPrograms || []
  const totalSF = selected.reduce((s, p) => s + (p.sf || p.defaultSF || 0), 0)
  const maxGFA = (state.lotW || 120) * (state.lotD || 160) * (state.farMax || 8)

  function toggleProgram(prog) {
    const existing = selected.find(p => p.id === prog.id)
    if (existing) {
      update({ selectedPrograms: selected.filter(p => p.id !== prog.id) })
    } else {
      update({ selectedPrograms: [...selected, { ...prog, sf: prog.defaultSF, floorH: prog.floorH }] })
    }
  }

  function updateProgram(id, patch) {
    update({ selectedPrograms: selected.map(p => p.id === id ? { ...p, ...patch } : p) })
  }

  function removeProgram(id) {
    update({ selectedPrograms: selected.filter(p => p.id !== id) })
  }

  function addCustom() {
    if (!customLabel.trim()) return
    const id = 'custom-' + Date.now()
    update({
      selectedPrograms: [...selected, {
        id, label: customLabel, color: customColor,
        defaultSF: customSF, sf: customSF,
        floorH: customH, category: 'custom',
        desc: 'Custom program', isCustom: true
      }]
    })
    setCustomLabel('')
  }

  const circulationPct = CIRCULATION_TYPES.find(c => c.id === state.circulationType)?.efficiencyRatio || 0.82
  const netSF = Math.round(totalSF * circulationPct)

  return (
    <div className="step-full">
      {/* Left: program selector */}
      <div className="prog-selector">
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <h1 className="step-title" style={{ fontSize: 28 }}>Select <em>programs.</em></h1>
            <span className="tag">Step 02</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Choose all spaces your building needs. Areas are pre-filled from industry standards — adjust any value.
          </p>

          {/* Category tabs */}
          <div className="cat-tabs">
            {PROGRAM_CATEGORIES.map(cat => (
              <button key={cat.id}
                className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Program grid */}
        <div className="prog-grid">
          {PROGRAM_CATEGORIES.find(c => c.id === activeCategory)?.programs.map(prog => {
            const isSelected = selected.some(p => p.id === prog.id)
            return (
              <div key={prog.id}
                className={`prog-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleProgram(prog)}>
                <div className="prog-card-dot" style={{ background: prog.color }} />
                <div className="prog-card-body">
                  <div className="prog-card-name">{prog.label}</div>
                  <div className="prog-card-desc">{prog.desc}</div>
                  <div className="prog-card-meta">
                    <span className="tag">{prog.defaultSF.toLocaleString()} sf</span>
                    <span className="tag">{prog.floorH}ft clg</span>
                    {prog.sfPerPerson && <span className="tag">{prog.sfPerPerson} sf/person</span>}
                  </div>
                </div>
                {isSelected && <div className="prog-check">✓</div>}
              </div>
            )
          })}

          {/* Custom program */}
          {activeCategory === 'specialty' && (
            <div className="prog-custom-add card-dark">
              <div className="section-label" style={{ marginBottom: 10 }}>Add custom program</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="text" placeholder="Program name" value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()} style={{ flex: 1 }} />
                  <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
                    style={{ width: 36, height: 34, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label className="field-label">Area (sf)</label>
                    <input type="number" value={customSF} onChange={e => setCustomSF(+e.target.value)} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label className="field-label">Ceiling ht (ft)</label>
                    <input type="number" value={customH} onChange={e => setCustomH(+e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }} onClick={addCustom}>
                  + Add Program
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar: selected programs + circulation */}
      <div className="side-pane">
        {/* GFA meter */}
        <div className="card-dark">
          <div className="section-label" style={{ marginBottom: 8 }}>GFA utilization</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Program total</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: totalSF > maxGFA ? 'var(--red)' : 'var(--green)' }}>
              {totalSF.toLocaleString()} / {Math.round(maxGFA).toLocaleString()} sf
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: Math.min(100, totalSF / maxGFA * 100) + '%',
              background: totalSF > maxGFA ? 'var(--red)' : totalSF / maxGFA > 0.85 ? 'var(--gold)' : 'var(--green)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Net after circulation</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{netSF.toLocaleString()} sf</span>
          </div>
        </div>

        {/* Selected list */}
        <div>
          <div className="section-head">
            <span className="section-label">Selected programs ({selected.length})</span>
            <div className="section-line" />
          </div>
          {selected.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '12px 0' }}>No programs selected yet</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selected.map(prog => (
              <div key={prog.id} className="selected-prog-row">
                <div className="sp-dot" style={{ background: prog.color }} />
                <div className="sp-body">
                  <div className="sp-name">{prog.label}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                      <label style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>AREA (SF)</label>
                      <input type="number" value={prog.sf || prog.defaultSF}
                        onChange={e => updateProgram(prog.id, { sf: +e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 12 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                      <label style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>CLG HT (FT)</label>
                      <input type="number" value={prog.floorH}
                        onChange={e => updateProgram(prog.id, { floorH: +e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 12 }} />
                    </div>
                    <button onClick={() => removeProgram(prog.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circulation */}
        <div>
          <div className="section-head">
            <span className="section-label">Circulation type</span>
            <div className="section-line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CIRCULATION_TYPES.map(ct => (
              <div key={ct.id}
                className={`circ-option ${state.circulationType === ct.id ? 'active' : ''}`}
                onClick={() => update({ circulationType: ct.id })}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ct.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{ct.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ct.desc}</div>
                </div>
                <span className="tag">{Math.round(ct.efficiencyRatio * 100)}% eff.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elevator & stairs */}
        <div>
          <div className="section-head">
            <span className="section-label">Elevators</span>
            <div className="section-line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {ELEVATOR_CONFIGS.map(ec => (
              <div key={ec.id}
                className={`circ-option ${state.elevatorConfig === ec.id ? 'active' : ''}`}
                onClick={() => update({ elevatorConfig: ec.id })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{ec.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ec.sfRange}</div>
                </div>
                <span className="tag">{ec.coreSize} sf core</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-head">
            <span className="section-label">Fire egress stairs</span>
            <div className="section-line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {STAIR_CONFIGS.map(sc => (
              <div key={sc.id}
                className={`circ-option ${state.stairConfig === sc.id ? 'active' : ''}`}
                onClick={() => update({ stairConfig: sc.id })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{sc.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{sc.ibc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button className="btn-ghost" onClick={onBack} style={{ flex: 1 }}>← Back</button>
          <button className="btn-primary" onClick={onNext} style={{ flex: 2 }} disabled={selected.length === 0}>
            Generate Massing →
          </button>
        </div>
      </div>
    </div>
  )
}
