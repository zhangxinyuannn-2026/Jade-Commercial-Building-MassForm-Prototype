import React, { useRef, useState } from 'react'
import './Step6Export.css'

function SummaryCard({label,value,sub}){
  return(
    <div className="ex-summary-card">
      <div className="ex-summary-label">{label}</div>
      <div className="ex-summary-val">{value}</div>
      {sub && <div className="ex-summary-sub">{sub}</div>}
    </div>
  )
}

function ProgramBar({prog}){
  return(
    <div className="ex-prog-bar">
      <div className="ex-prog-color" style={{background:prog.color}}/>
      <span className="ex-prog-name">{prog.label}</span>
      <span className="ex-prog-sf">{(prog.sf||prog.defaultSF||0).toLocaleString()} sf</span>
      <span className="ex-prog-h">{prog.floorH}ft clg</span>
    </div>
  )
}

export default function Step6Export({state,onBack}){
  const reportRef = useRef(null)
  const [printing,setPrinting] = useState(false)

  const programs = state.selectedPrograms||[]
  const totalSF  = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA   = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW     = (state.lotW||120)-(state.sideSB||10)*2
  const envD     = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors   = Math.max(1,Math.round(totalSF/(envW*envD)))
  const totalH   = floors*14
  const farUsed  = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)
  const today    = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => { window.print(); setPrinting(false) }, 100)
  }

  return(
    <div className="step-wrap" style={{maxWidth:860}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Export <em>study.</em></h1>
        <span className="tag">Step 06</span>
      </div>
      <p className="step-sub">Your commercial massing study is ready. Download as a client-ready PDF report or share the summary below.</p>

      {/* Export actions */}
      <div className="ex-actions">
        <button className="btn-primary" onClick={handlePrint} disabled={printing} style={{display:'flex',alignItems:'center',gap:8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          {printing?'Opening print dialog…':'Print / Save PDF'}
        </button>
        <button className="btn-ghost" style={{display:'flex',alignItems:'center',gap:6}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          Copy share link
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back to Facade</button>
      </div>

      {/* Printable report */}
      <div className="ex-report" ref={reportRef} id="massform-report">
        {/* Header */}
        <div className="ex-header">
          <div className="ex-header-left">
            <div className="ex-logo">MassForm <span>/ {state.projectName||'Commercial Study'}</span></div>
            <div className="ex-byline">by Jade · Commercial Massing Engine · Prototype v0.1</div>
          </div>
          <div className="ex-header-right">
            <div className="ex-date">{today}</div>
            <div className="ex-tag-row">
              <span className="ex-tag">{state.massingType?.toUpperCase()||'BOX'}</span>
              <span className="ex-tag">{state.orientation||'N'}-FACING</span>
              <span className="ex-tag">FAR {farUsed}</span>
            </div>
          </div>
        </div>

        <div className="ex-divider"/>

        {/* Site summary */}
        <div className="ex-section-title">01 — Site parameters</div>
        <div className="ex-grid-4">
          <SummaryCard label="Lot width" value={(state.lotW||120)+' ft'} />
          <SummaryCard label="Lot depth" value={(state.lotD||160)+' ft'} />
          <SummaryCard label="Lot area" value={((state.lotW||120)*(state.lotD||160)).toLocaleString()+' sf'} />
          <SummaryCard label="Max FAR" value={state.farMax||8} />
          <SummaryCard label="Max height" value={(state.heightMax||180)+' ft'} />
          <SummaryCard label="Front setback" value={(state.frontSB||15)+' ft'} />
          <SummaryCard label="Side setback" value={(state.sideSB||10)+' ft'} />
          <SummaryCard label="Rear setback" value={(state.rearSB||20)+' ft'} />
        </div>

        <div className="ex-divider"/>

        {/* Massing summary */}
        <div className="ex-section-title">02 — Massing summary</div>
        <div className="ex-grid-4">
          <SummaryCard label="Total GFA" value={totalSF.toLocaleString()+' sf'} sub={'of '+Math.round(maxGFA).toLocaleString()+' sf max'} />
          <SummaryCard label="FAR used" value={farUsed} sub={'Max '+state.farMax} />
          <SummaryCard label="Est. floors" value={floors} sub={totalH+' ft total'} />
          <SummaryCard label="Envelope" value={envW+'×'+envD+' ft'} sub={'After setbacks'} />
          <SummaryCard label="Massing type" value={(state.massingType||'Box').charAt(0).toUpperCase()+(state.massingType||'box').slice(1)} />
          <SummaryCard label="Orientation" value={state.orientation||'N'} sub={'True north'} />
          <SummaryCard label="Circulation" value={state.circulationType||'—'} />
          <SummaryCard label="Elevators" value={state.elevatorConfig||'—'} />
        </div>

        <div className="ex-divider"/>

        {/* Program breakdown */}
        <div className="ex-section-title">03 — Program schedule</div>
        {programs.length > 0 ? (
          <>
            <div className="ex-prog-list">
              {programs.map(p=><ProgramBar key={p.id} prog={p} />)}
            </div>
            <div className="ex-prog-total">
              <span>Total program area</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600}}>{totalSF.toLocaleString()} sf</span>
            </div>
            {/* Program proportion chart */}
            <div className="ex-prog-chart">
              {programs.map(p=>{
                const pct=(p.sf||p.defaultSF||0)/totalSF*100
                return <div key={p.id} className="ex-chart-bar" style={{width:pct+'%',background:p.color,minWidth:2}} title={p.label+': '+Math.round(pct)+'%'} />
              })}
            </div>
            <div className="ex-chart-legend">
              {programs.map(p=>(
                <div key={p.id} className="ex-legend-item">
                  <div className="ex-legend-dot" style={{background:p.color}}/>
                  <span>{p.label}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ink-dim)'}}>{Math.round((p.sf||p.defaultSF||0)/totalSF*100)}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{fontSize:12,color:'var(--ink-ghost)',fontStyle:'italic'}}>No programs selected — go back to Step 2 to add programs.</p>
        )}

        <div className="ex-divider"/>

        {/* Notes */}
        <div className="ex-section-title">04 — Design notes</div>
        <div className="ex-notes-area">
          <div className="ex-notes-placeholder">Design notes, client comments and next steps…</div>
          <div className="ex-notes-lines">
            {Array(6).fill(0).map((_,i)=><div key={i} className="ex-notes-line"/>)}
          </div>
        </div>

        <div className="ex-divider"/>

        {/* Footer */}
        <div className="ex-footer">
          <span>MassForm — Commercial Massing Engine by Jade</span>
          <span>massform.vercel.app</span>
          <span>Prototype v0.1 · {today}</span>
          <span>All areas are estimates only. Verify with licensed architect.</span>
        </div>
      </div>
    </div>
  )
}
