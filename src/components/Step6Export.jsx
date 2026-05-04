import React, { useRef, useEffect, useState } from 'react'
import './Step6Export.css'

// Import the same drawing functions from Step3 logic (inline here for export)
const COLOR_MAP = {
  office:    { fill:'#b8d4e8', stroke:'#6fa3c8', text:'#1c3a52' },
  office2:   { fill:'#c8e0ee', stroke:'#7abed0', text:'#1a3048' },
  retail:    { fill:'#f9c784', stroke:'#d4a24e', text:'#3d2800' },
  amenity:   { fill:'#b8e0c8', stroke:'#5aaa80', text:'#0d3020' },
  mech:      { fill:'#d0ccc8', stroke:'#9a9690', text:'#2a2822' },
  rooftop:   { fill:'#f0c8b0', stroke:'#cc8860', text:'#3a1800' },
  highlight: { fill:'#ffd0a0', stroke:'#c89040', text:'#3a1a00' },
  void:      { fill:'rgba(200,218,232,0.3)', stroke:'#7a9aaa', text:'#4a6a7a' },
  core:      { fill:'#e8ddd0', stroke:'#aa9880', text:'#3a2c1e' },
}

const VARIANT_LIBRARY = {
  box:[
    {name:'Central Core',ref:'Seagram Building typology',note:'Core centred, equal perimeter offices.',sectionProfile:[{xPct:0,wPct:1.0,label:'Office',floors:1.0,colorKey:'office'}],planType:'central-core'},
    {name:'Podium + Shaft',ref:'30 Hudson Yards — KPF',note:'Wide podium + slender tower shaft.',sectionProfile:[{xPct:0,wPct:1.0,label:'Amenity Podium',floors:0.18,colorKey:'amenity'},{xPct:0.15,wPct:0.7,label:'Office Shaft',floors:0.82,colorKey:'office'}],planType:'podium-shaft'},
    {name:'Dual-Band',ref:'Shard typology — Renzo Piano',note:'Programme bands expressed in section.',sectionProfile:[{xPct:0,wPct:1.0,label:'Retail/Lobby',floors:0.1,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Trading',floors:0.2,colorKey:'highlight'},{xPct:0,wPct:1.0,label:'Office',floors:0.55,colorKey:'office'},{xPct:0.1,wPct:0.8,label:'Mechanical',floors:0.08,colorKey:'mech'},{xPct:0.3,wPct:0.4,label:'Crown',floors:0.07,colorKey:'rooftop'}],planType:'central-core'},
    {name:'End Core',ref:'Lever House typology — SOM',note:'Core at north end, south facade for glazing.',sectionProfile:[{xPct:0,wPct:1.0,label:'Office',floors:0.92,colorKey:'office'},{xPct:0,wPct:0.18,label:'Core',floors:1.0,colorKey:'core'}],planType:'end-core'},
  ],
  taper:[
    {name:'Classic Taper',ref:'Empire State / Chrysler tradition',note:'Gradual reduction from base to crown.',sectionProfile:[{xPct:0,wPct:1.0,label:'Podium',floors:0.15,colorKey:'retail'},{xPct:0.05,wPct:0.9,label:'Office',floors:0.35,colorKey:'office'},{xPct:0.12,wPct:0.76,label:'Office',floors:0.25,colorKey:'office2'},{xPct:0.22,wPct:0.56,label:'Office',floors:0.18,colorKey:'office'},{xPct:0.35,wPct:0.3,label:'Crown',floors:0.07,colorKey:'rooftop'}],planType:'central-core'},
    {name:'Pixelated Taper',ref:'MVRDV / BIG pixel tower',note:'Irregular steps create external terraces.',sectionProfile:[{xPct:0,wPct:1.0,label:'Retail',floors:0.12,colorKey:'retail'},{xPct:0,wPct:0.82,label:'Office',floors:0.28,colorKey:'office'},{xPct:0.06,wPct:0.88,label:'Office',floors:0.1,colorKey:'office2'},{xPct:0.15,wPct:0.7,label:'Amenity',floors:0.06,colorKey:'amenity'},{xPct:0.15,wPct:0.55,label:'Office',floors:0.28,colorKey:'office'},{xPct:0.28,wPct:0.3,label:'Rooftop',floors:0.1,colorKey:'rooftop'}],planType:'end-core'},
    {name:'Inverted Taper',ref:'CCTV HQ typology — OMA',note:'Wider at top — cantilevered upper floors.',sectionProfile:[{xPct:0.2,wPct:0.6,label:'Lobby/Mech',floors:0.12,colorKey:'mech'},{xPct:0.12,wPct:0.76,label:'Office',floors:0.35,colorKey:'office'},{xPct:0.05,wPct:0.9,label:'Office',floors:0.3,colorKey:'office2'},{xPct:0,wPct:1.0,label:'Amenity/Sky',floors:0.23,colorKey:'amenity'}],planType:'central-core'},
    {name:'Chamfered Tower',ref:'122 Leadenhall — Rogers Stirk Harbour',note:'Diagonal chamfer reduces bulk, maximises crown views.',sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby/Retail',floors:0.12,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.45,colorKey:'office'},{xPct:0.08,wPct:0.92,label:'Office',floors:0.2,colorKey:'office2'},{xPct:0.18,wPct:0.82,label:'Office+Amen.',floors:0.15,colorKey:'amenity'},{xPct:0.35,wPct:0.5,label:'Crown',floors:0.08,colorKey:'rooftop'}],planType:'side-core'},
  ],
  stepped:[
    {name:'Skyline Steps',ref:'Rockefeller Center tradition',note:'Three setbacks create sky terraces.',sectionProfile:[{xPct:0,wPct:1.0,label:'Retail Podium',floors:0.15,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Lower Office',floors:0.22,colorKey:'office'},{xPct:0.12,wPct:0.76,label:'Sky Terrace',floors:0.06,colorKey:'amenity'},{xPct:0.12,wPct:0.76,label:'Mid Office',floors:0.28,colorKey:'office2'},{xPct:0.25,wPct:0.5,label:'Sky Terrace',floors:0.05,colorKey:'amenity'},{xPct:0.25,wPct:0.5,label:'Upper Office',floors:0.18,colorKey:'office'},{xPct:0.35,wPct:0.3,label:'Crown',floors:0.06,colorKey:'rooftop'}],planType:'central-core'},
    {name:'Cascading Terraces',ref:'One Angel Square — BDP',note:'Steps cascade south-facing for solar access.',sectionProfile:[{xPct:0,wPct:1.0,label:'Ground Activation',floors:0.12,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office Band 1',floors:0.2,colorKey:'office'},{xPct:0.08,wPct:0.85,label:'Terrace+Office',floors:0.18,colorKey:'office2'},{xPct:0.18,wPct:0.7,label:'Office Band 3',floors:0.25,colorKey:'office'},{xPct:0.3,wPct:0.55,label:'Amenity',floors:0.08,colorKey:'amenity'},{xPct:0.3,wPct:0.4,label:'Upper Office',floors:0.17,colorKey:'office2'}],planType:'end-core'},
    {name:'Pixelated Stack',ref:'VIA 57 West / BIG hybrid',note:'Irregular programme blocks, expressive facade.',sectionProfile:[{xPct:0,wPct:1.0,label:'Parking/Lobby',floors:0.1,colorKey:'mech'},{xPct:0,wPct:0.9,label:'Co-Working',floors:0.12,colorKey:'highlight'},{xPct:0,wPct:0.75,label:'Office',floors:0.25,colorKey:'office'},{xPct:0.1,wPct:0.65,label:'Amenity Sky',floors:0.08,colorKey:'amenity'},{xPct:0.22,wPct:0.55,label:'Office Tower',floors:0.3,colorKey:'office2'},{xPct:0.32,wPct:0.35,label:'Rooftop Lounge',floors:0.15,colorKey:'rooftop'}],planType:'side-core'},
  ],
  courtyard:[
    {name:'Central Atrium',ref:'Lloyd\'s of London — Richard Rogers',note:"Internal atrium floods all floors with daylight.",sectionProfile:[{xPct:0,wPct:0.28,label:'Office Wing W',floors:1.0,colorKey:'office'},{xPct:0.35,wPct:0.3,label:'Atrium Void',floors:1.0,colorKey:'void'},{xPct:0.72,wPct:0.28,label:'Office Wing E',floors:1.0,colorKey:'office2'}],planType:'perimeter-core'},
    {name:'Sky Garden Core',ref:'The Gherkin — Foster + Partners',note:'Sky gardens cut into tower every 8–10 floors.',sectionProfile:[{xPct:0,wPct:1.0,label:'Podium',floors:0.12,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.2,colorKey:'office'},{xPct:0.05,wPct:0.9,label:'Sky Garden',floors:0.06,colorKey:'amenity'},{xPct:0,wPct:1.0,label:'Office',floors:0.2,colorKey:'office2'},{xPct:0.05,wPct:0.9,label:'Sky Garden',floors:0.06,colorKey:'amenity'},{xPct:0.1,wPct:0.8,label:'Office',floors:0.22,colorKey:'office'},{xPct:0.2,wPct:0.6,label:'Crown Terrace',floors:0.14,colorKey:'rooftop'}],planType:'perimeter-core'},
    {name:'Split Courtyard',ref:'Tencent HQ — NBBJ',note:'Two slabs framing shared courtyard/garden.',sectionProfile:[{xPct:0,wPct:0.4,label:'Tower A',floors:1.0,colorKey:'office'},{xPct:0.42,wPct:0.16,label:'Garden',floors:0.3,colorKey:'void'},{xPct:0.6,wPct:0.4,label:'Tower B',floors:0.85,colorKey:'office2'},{xPct:0.42,wPct:0.16,label:'Bridge',floors:0.15,colorKey:'amenity'}],planType:'dual-core'},
  ],
  cluster:[
    {name:'Podium + Twin Towers',ref:'Marina Bay Sands / One WTC',note:'Shared podium unites two towers of different heights.',sectionProfile:[{xPct:0,wPct:1.0,label:'Shared Podium',floors:0.15,colorKey:'retail'},{xPct:0,wPct:0.42,label:'Tower A',floors:0.85,colorKey:'office'},{xPct:0.58,wPct:0.42,label:'Tower B (tall)',floors:1.0,colorKey:'office2'},{xPct:0.15,wPct:0.7,label:'Sky Bridge',floors:0.05,colorKey:'amenity'}],planType:'dual-core'},
    {name:'Asymmetric Cluster',ref:'Tour Carpe Diem / Morphosis',note:'3 volumes of different heights stepping down.',sectionProfile:[{xPct:0,wPct:0.32,label:'Low-rise Vol.',floors:0.35,colorKey:'retail'},{xPct:0.34,wPct:0.3,label:'Mid Tower',floors:0.65,colorKey:'office2'},{xPct:0.66,wPct:0.34,label:'Main Tower',floors:1.0,colorKey:'office'},{xPct:0,wPct:1.0,label:'Ground Podium',floors:0.1,colorKey:'amenity'}],planType:'triple-core'},
    {name:'Linked Volumes',ref:'Bloomberg HQ London — Foster+Partners',note:'Two offset slabs linked at mid-level by sky bridges.',sectionProfile:[{xPct:0,wPct:0.44,label:'Slab A',floors:0.9,colorKey:'office'},{xPct:0.44,wPct:0.12,label:'Bridge+Void',floors:0.3,colorKey:'void'},{xPct:0.56,wPct:0.44,label:'Slab B',floors:1.0,colorKey:'office2'},{xPct:0.15,wPct:0.7,label:'Connecting Bridge',floors:0.08,colorKey:'highlight'}],planType:'dual-core'},
  ],
}

function drawExportSection(ctx, W, H, variant) {
  if (!variant) return
  ctx.clearRect(0,0,W,H)
  const PAD_L=50,PAD_R=16,PAD_T=24,PAD_B=44
  const drawW=W-PAD_L-PAD_R,drawH=H-PAD_T-PAD_B
  const profile=variant.sectionProfile
  const totalFloors=profile.reduce((s,b)=>s+b.floors,0)
  ctx.fillStyle='#8aaa88'; ctx.fillRect(PAD_L-8,PAD_T+drawH,drawW+16,3)
  let yAcc=0
  profile.forEach(band=>{
    const bH=(band.floors/totalFloors)*drawH
    const bx=PAD_L+band.xPct*drawW,bw=band.wPct*drawW,by=PAD_T+yAcc
    const col=COLOR_MAP[band.colorKey]||COLOR_MAP.office
    if(band.colorKey==='void'){
      ctx.save(); ctx.beginPath(); ctx.rect(bx,by,bw,bH); ctx.clip()
      ctx.fillStyle='rgba(200,218,232,0.2)'; ctx.fillRect(bx,by,bw,bH)
      ctx.strokeStyle='rgba(100,140,160,0.2)'; ctx.lineWidth=0.7
      for(let d=-bH;d<bw;d+=7){ctx.beginPath();ctx.moveTo(bx+d,by);ctx.lineTo(bx+d+bH,by+bH);ctx.stroke()}
      ctx.restore()
    } else { ctx.fillStyle=col.fill; ctx.fillRect(bx,by,bw,bH) }
    ctx.strokeStyle=col.stroke; ctx.lineWidth=0.8; ctx.strokeRect(bx+0.5,by+0.5,bw-1,bH-1)
    const fCount=Math.max(2,Math.round(band.floors*3))
    ctx.strokeStyle=`${col.stroke}44`; ctx.lineWidth=0.4
    for(let f=1;f<fCount;f++){ctx.beginPath();ctx.moveTo(bx+2,by+f*(bH/fCount));ctx.lineTo(bx+bw-2,by+f*(bH/fCount));ctx.stroke()}
    if(bH>12){
      ctx.fillStyle=col.text; ctx.font=`${Math.min(10,Math.max(7,bH*0.22))}px DM Mono, monospace`
      ctx.textAlign='left'; ctx.fillText(band.label,bx+4,by+Math.min(12,bH*0.55))
    }
    yAcc+=bH
  })
  ctx.fillStyle='#4a7055'; ctx.font='9px DM Mono, monospace'
  ctx.textAlign='center'; ctx.fillText(`${variant.envW||100} ft`,PAD_L+drawW/2,PAD_T+drawH+24)
  ctx.fillStyle='#1c2e20'; ctx.font="bold 10px 'DM Mono', monospace"; ctx.textAlign='left'
  ctx.fillText(variant.name||'',PAD_L,PAD_T-8)
}

function drawExportPlan(ctx, W, H, variant) {
  if (!variant) return
  ctx.clearRect(0,0,W,H)
  const PAD=16,dW=W-PAD*2,dH=H-PAD*2
  ctx.fillStyle='#dce8f2'; ctx.fillRect(PAD,PAD,dW,dH)
  ctx.strokeStyle='#4a7055'; ctx.lineWidth=1.2; ctx.strokeRect(PAD,PAD,dW,dH)
  const sb=12; ctx.strokeStyle='rgba(74,112,85,0.25)'; ctx.lineWidth=0.6; ctx.setLineDash([3,3])
  ctx.strokeRect(PAD+sb,PAD+sb,dW-sb*2,dH-sb*2); ctx.setLineDash([])
  const pt=variant.planType||'central-core'
  if(pt==='central-core'){
    const cx=PAD+dW/2-dW*0.1,cy=PAD+dH/2-dH*0.12
    ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=0.8
    ctx.fillRect(cx,cy,dW*0.2,dH*0.24); ctx.strokeRect(cx,cy,dW*0.2,dH*0.24)
    ctx.fillStyle='#4a7055'; ctx.font='7px DM Mono,monospace'; ctx.textAlign='center'
    ctx.fillText('CORE',cx+dW*0.1,cy+dH*0.14)
    ctx.fillStyle='#1c3a52'; ctx.fillText('OFFICE',PAD+dW/2,PAD+15)
  } else if(pt==='end-core'){
    ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=0.8
    ctx.fillRect(PAD,PAD,dW*0.18,dH); ctx.strokeRect(PAD,PAD,dW*0.18,dH)
    ctx.fillStyle='#4a7055'; ctx.font='7px DM Mono,monospace'; ctx.textAlign='center'
    ctx.save(); ctx.translate(PAD+dW*0.09,PAD+dH/2); ctx.rotate(-Math.PI/2)
    ctx.fillText('CORE',0,0); ctx.restore()
    ctx.fillStyle='#1c3a52'; ctx.fillText('OPEN OFFICE PLATE',PAD+dW*0.6,PAD+dH/2)
  } else if(pt==='perimeter-core'){
    const cSz=dW*0.12
    ;[[PAD,PAD],[PAD+dW-cSz,PAD],[PAD,PAD+dH-cSz],[PAD+dW-cSz,PAD+dH-cSz]].forEach(([x,y])=>{
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=0.8
      ctx.fillRect(x,y,cSz,cSz); ctx.strokeRect(x,y,cSz,cSz)
    })
    const aw=dW*0.34,ah=dH*0.34
    ctx.fillStyle='rgba(180,220,240,0.3)'; ctx.strokeStyle='#7abed0'; ctx.lineWidth=1; ctx.setLineDash([2,2])
    ctx.fillRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah); ctx.strokeRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah); ctx.setLineDash([])
    ctx.fillStyle='#2d6a8a'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
    ctx.fillText('ATRIUM',PAD+dW/2,PAD+dH/2+3)
  } else if(pt==='dual-core'){
    const cW=dW*0.14,cH=dH*0.35
    ;[PAD+dW*0.2-cW/2,PAD+dW*0.8-cW/2].forEach(x=>{
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=0.8
      const y=PAD+dH/2-cH/2
      ctx.fillRect(x,y,cW,cH); ctx.strokeRect(x,y,cW,cH)
    })
    ctx.fillStyle='rgba(200,218,232,0.35)'; ctx.strokeStyle='#7a9aaa'; ctx.setLineDash([2,2]); ctx.lineWidth=0.7
    ctx.fillRect(PAD+dW*0.38,PAD,dW*0.24,dH); ctx.strokeRect(PAD+dW*0.38,PAD,dW*0.24,dH); ctx.setLineDash([])
    ctx.fillStyle='#2d6a8a'; ctx.font='7px DM Mono,monospace'; ctx.textAlign='center'
    ctx.fillText('VOID',PAD+dW/2,PAD+dH/2+3)
  }
  ctx.save(); ctx.translate(W-PAD-12,PAD+12)
  ctx.fillStyle='#2d6a4f'; ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(3,0); ctx.lineTo(0,-3); ctx.lineTo(-3,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#adc5b5'; ctx.beginPath(); ctx.moveTo(0,9); ctx.lineTo(3,0); ctx.lineTo(0,3); ctx.lineTo(-3,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#2d6a4f'; ctx.font='6px DM Mono,monospace'; ctx.textAlign='center'; ctx.fillText('N',0,-12)
  ctx.restore()
}

function SummaryCard({label,value,sub}){return(<div className="ex-summary-card"><div className="ex-summary-label">{label}</div><div className="ex-summary-val">{value}</div>{sub&&<div className="ex-summary-sub">{sub}</div>}</div>)}
function ProgramBar({prog}){return(<div className="ex-prog-bar"><div className="ex-prog-color" style={{background:prog.color}}/><span className="ex-prog-name">{prog.label}</span><span className="ex-prog-sf">{(prog.sf||prog.defaultSF||0).toLocaleString()} sf</span><span className="ex-prog-h">{prog.floorH}ft</span></div>)}

export default function Step6Export({state,onBack}){
  const sectionExportRef=useRef(null)
  const planExportRef=useRef(null)
  const [printing,setPrinting]=useState(false)

  const programs=state.selectedPrograms||[]
  const totalSF=programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA=(state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW=(state.lotW||120)-(state.sideSB||10)*2
  const envD=(state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors=Math.max(1,Math.round(totalSF/(envW*envD)))
  const farUsed=(totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})

  // Find selected variant
  const massingType=state.massingType||'box'
  const variantName=state.selectedMassingVariant
  const variants=VARIANT_LIBRARY[massingType]||[]
  const selectedVariant=variants.find(v=>v.name===variantName)||variants[0]
  const enrichedVariant = selectedVariant ? {...selectedVariant,envW,envD,maxFloors:Math.max(4,Math.round((state.heightMax||180)/14))} : null

  useEffect(()=>{
    if (!enrichedVariant) return
    if (sectionExportRef.current){
      const c=sectionExportRef.current; drawExportSection(c.getContext('2d'),c.width,c.height,enrichedVariant)
    }
    if (planExportRef.current){
      const c=planExportRef.current; drawExportPlan(c.getContext('2d'),c.width,c.height,enrichedVariant)
    }
  },[enrichedVariant])

  return(
    <div className="step-wrap" style={{maxWidth:860}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Export <em>study.</em></h1>
        <span className="tag">Step 06</span>
      </div>
      <p className="step-sub">Your commercial massing study is ready. Print or save as PDF — the report includes site parameters, programme schedule, section and plan diagrams.</p>

      <div className="ex-actions">
        <button className="btn-primary" onClick={()=>{setPrinting(true);setTimeout(()=>{window.print();setPrinting(false)},100)}} disabled={printing} style={{display:'flex',alignItems:'center',gap:8}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          {printing?'Preparing…':'Print / Save PDF'}
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back to Facade</button>
      </div>

      {/* Report */}
      <div className="ex-report" id="massform-report">
        {/* Header */}
        <div className="ex-header">
          <div>
            <div className="ex-logo">MassForm <span>/ {state.projectName||'Commercial Study'}</span></div>
            <div className="ex-byline">by Jade · Commercial Massing Engine · Prototype v0.1</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="ex-date">{today}</div>
            <div className="ex-tag-row">
              <span className="ex-tag">{massingType.toUpperCase()}</span>
              <span className="ex-tag">{enrichedVariant?.name||'—'}</span>
              <span className="ex-tag">{state.orientation||'N'}-FACING</span>
              <span className="ex-tag">FAR {farUsed}</span>
            </div>
          </div>
        </div>
        <div className="ex-divider"/>

        {/* Diagrams side by side */}
        {enrichedVariant && (
          <>
            <div className="ex-section-title">01 — Massing section & plan</div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1.2fr',gap:16,marginBottom:4}}>
              <div>
                <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--ink-dim)',letterSpacing:'0.1em',marginBottom:4}}>SECTION</div>
                <canvas ref={sectionExportRef} width={440} height={240} style={{width:'100%',border:'1px solid var(--border)',borderRadius:6,display:'block'}} />
              </div>
              <div>
                <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--ink-dim)',letterSpacing:'0.1em',marginBottom:4}}>FLOOR PLAN (TYPICAL)</div>
                <canvas ref={planExportRef} width={240} height={240} style={{width:'100%',border:'1px solid var(--border)',borderRadius:6,display:'block'}} />
              </div>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
              {[...new Map(enrichedVariant.sectionProfile.map(b=>[b.colorKey,b])).values()].map(b=>{
                const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
                return(
                  <div key={b.colorKey} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'var(--ink-mid)'}}>
                    <div style={{width:12,height:8,background:col.fill,border:`1px solid ${col.stroke}`,borderRadius:2}}/>
                    {b.label}
                  </div>
                )
              })}
            </div>
            <div style={{fontSize:10,color:'var(--ink-dim)',fontStyle:'italic',marginBottom:0}}>
              {enrichedVariant.name} — {enrichedVariant.ref} · {enrichedVariant.note}
            </div>
            <div className="ex-divider"/>
          </>
        )}

        {/* Site */}
        <div className="ex-section-title">02 — Site parameters</div>
        <div className="ex-grid-4">
          <SummaryCard label="Lot width" value={(state.lotW||120)+' ft'}/>
          <SummaryCard label="Lot depth" value={(state.lotD||160)+' ft'}/>
          <SummaryCard label="Lot area" value={((state.lotW||120)*(state.lotD||160)).toLocaleString()+' sf'}/>
          <SummaryCard label="Max FAR" value={state.farMax||8}/>
          <SummaryCard label="Max height" value={(state.heightMax||180)+' ft'}/>
          <SummaryCard label="Front setback" value={(state.frontSB||15)+' ft'}/>
          <SummaryCard label="Side setback" value={(state.sideSB||10)+' ft'}/>
          <SummaryCard label="Rear setback" value={(state.rearSB||20)+' ft'}/>
        </div>
        <div className="ex-divider"/>

        {/* Massing */}
        <div className="ex-section-title">03 — Massing summary</div>
        <div className="ex-grid-4">
          <SummaryCard label="Total GFA" value={totalSF.toLocaleString()+' sf'} sub={'of '+Math.round(maxGFA).toLocaleString()+' max'}/>
          <SummaryCard label="FAR used" value={farUsed} sub={'Max '+state.farMax}/>
          <SummaryCard label="Est. floors" value={floors} sub={(floors*14)+' ft total'}/>
          <SummaryCard label="Envelope" value={envW+'×'+envD+' ft'}/>
          <SummaryCard label="Massing type" value={massingType.charAt(0).toUpperCase()+massingType.slice(1)}/>
          <SummaryCard label="Variant" value={enrichedVariant?.name||'—'}/>
          <SummaryCard label="Orientation" value={state.orientation||'N'}/>
          <SummaryCard label="Circulation" value={state.circulationType||'—'}/>
        </div>
        <div className="ex-divider"/>

        {/* Programmes */}
        <div className="ex-section-title">04 — Programme schedule</div>
        {programs.length>0?(
          <>
            <div className="ex-prog-list">{programs.map(p=><ProgramBar key={p.id} prog={p}/>)}</div>
            <div className="ex-prog-total"><span>Total programme area</span><span style={{fontFamily:'var(--font-mono)',fontWeight:600}}>{totalSF.toLocaleString()} sf</span></div>
            <div className="ex-prog-chart">{programs.map(p=>{const pct=(p.sf||p.defaultSF||0)/totalSF*100;return<div key={p.id} className="ex-chart-bar" style={{width:pct+'%',background:p.color,minWidth:2}} title={p.label}/>})}</div>
            <div className="ex-chart-legend">{programs.map(p=>(<div key={p.id} className="ex-legend-item"><div className="ex-legend-dot" style={{background:p.color}}/><span>{p.label}</span><span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ink-dim)'}}>{Math.round((p.sf||p.defaultSF||0)/totalSF*100)}%</span></div>))}</div>
          </>
        ):(
          <p style={{fontSize:12,color:'var(--ink-ghost)',fontStyle:'italic'}}>No programmes selected.</p>
        )}
        <div className="ex-divider"/>

        {/* Notes */}
        <div className="ex-section-title">05 — Design notes</div>
        <div className="ex-notes-area">
          <div className="ex-notes-placeholder">Design notes, client comments and next steps…</div>
          <div className="ex-notes-lines">{Array(5).fill(0).map((_,i)=><div key={i} className="ex-notes-line"/>)}</div>
        </div>
        <div className="ex-divider"/>

        <div className="ex-footer">
          <span>MassForm — Commercial Massing Engine by Jade</span>
          <span>massform.vercel.app</span>
          <span>Prototype v0.1 · {today}</span>
          <span>All areas are estimates. Verify with licensed architect.</span>
        </div>
      </div>
    </div>
  )
}
