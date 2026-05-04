import React, { useState, useRef, useEffect } from 'react'
import './Step5Facade.css'

const GLASS_COST={standard:28,highPerf:55,triple:95,electrochromic:180}
const WALL_COST={concrete:22,terracotta:38,metalPanel:32,stone:65}
const ENERGY_BASE=4.50

export default function Step5Facade({state,update,onNext,onBack}){
  const [glassN,setGlassN]=useState(30),[glassS,setGlassS]=useState(55)
  const [glassE,setGlassE]=useState(45),[glassW,setGlassW]=useState(35)
  const [winH,setWinH]=useState(7),[winW,setWinW]=useState(5),[winSpacing,setWinSpacing]=useState(3)
  const [glassType,setGlassType]=useState('highPerf'),[wallType,setWallType]=useState('metalPanel')
  const [activeView,setActiveView]=useState('S')
  const canvasRef=useRef(null)

  const programs=state.selectedPrograms||[]
  const totalSF=programs.reduce((s,p)=>s+(p.sf||0),0)
  const envW=(state.lotW||120)-(state.sideSB||10)*2
  const envD=(state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors=Math.max(1,Math.round(totalSF/(envW*envD)))
  const totalH=floors*14
  const facadeW={N:envW,S:envW,E:envD,W:envD}
  const glassRatios={N:glassN,S:glassS,E:glassE,W:glassW}

  let totalGlassArea=0,totalWallArea=0
  const facadeAreas={}
  Object.entries(facadeW).forEach(([face,w])=>{
    const tot=w*totalH,gl=tot*glassRatios[face]/100
    facadeAreas[face]={total:tot,glass:gl,wall:tot-gl}
    totalGlassArea+=gl; totalWallArea+=tot-gl
  })
  const glassCost=Math.round(totalGlassArea*GLASS_COST[glassType])
  const wallCost=Math.round(totalWallArea*WALL_COST[wallType])
  const totalFacadeCost=glassCost+wallCost
  const solarHeatGain=(glassS*0.8+glassW*1.2+glassE*0.6+glassN*0.2)/4
  const annualEnergyCost=Math.round(totalSF*ENERGY_BASE*(1+(solarHeatGain-40)/100*0.3))
  const energySaving=Math.round(totalSF*ENERGY_BASE*0.15*(glassType==='electrochromic'?2:glassType==='triple'?1.5:1))

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    const W=canvas.width,H=canvas.height
    ctx.clearRect(0,0,W,H)
    const fw=facadeW[activeView],fh=totalH
    const scaleX=(W-40)/fw,scaleY=(H-40)/fh
    const scale=Math.min(scaleX,scaleY)
    const offX=(W-fw*scale)/2,offY=(H-fh*scale)/2
    const gr=glassRatios[activeView]/100

    // Wall background — warm stone
    ctx.fillStyle='#c8d5c0'
    ctx.fillRect(offX,offY,fw*scale,fh*scale)

    const wW=winW*scale,wH=winH*scale,gutter=winSpacing*scale
    const cols=Math.max(1,Math.floor((fw*scale+gutter)/(wW+gutter)))
    const totalWinW=cols*wW+(cols-1)*gutter
    const panelOffX=offX+(fw*scale-totalWinW)/2
    const floorPx=fh*scale/floors

    for(let row=0;row<floors;row++){
      const fy=offY+row*floorPx
      ctx.strokeStyle='rgba(44,74,53,0.18)'; ctx.lineWidth=0.5
      ctx.beginPath(); ctx.moveTo(offX,fy); ctx.lineTo(offX+fw*scale,fy); ctx.stroke()
      for(let col=0;col<cols;col++){
        if(Math.random()>gr*1.15) continue
        const wx=panelOffX+col*(wW+gutter),wy=fy+(floorPx-wH)/2
        const grad=ctx.createLinearGradient(wx,wy,wx+wW,wy+wH)
        grad.addColorStop(0,'rgba(180,210,235,0.85)')
        grad.addColorStop(0.4,'rgba(220,235,248,0.7)')
        grad.addColorStop(1,'rgba(140,185,220,0.8)')
        ctx.fillStyle=grad; ctx.fillRect(wx,wy,wW,wH)
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(wx+1,wy+1,wW*0.28,wH*0.55)
        ctx.strokeStyle='rgba(44,74,53,0.2)'; ctx.lineWidth=0.5; ctx.strokeRect(wx,wy,wW,wH)
      }
    }
    ctx.strokeStyle='rgba(44,74,53,0.4)'; ctx.lineWidth=1.5; ctx.strokeRect(offX,offY,fw*scale,fh*scale)
    ctx.fillStyle='var(--ink-dim)'
    ctx.font='10px DM Mono, monospace'
    ctx.fillStyle='rgba(44,74,53,0.55)'
    ctx.fillText(`${activeView} — ${glassRatios[activeView]}% glazing · ${Math.round(fw)}×${Math.round(totalH)}ft`,offX,offY-8)
  },[activeView,glassN,glassS,glassE,glassW,winH,winW,winSpacing,floors,totalH,state])

  return(
    <div className="step-wrap" style={{maxWidth:1100}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Facade <em>design.</em></h1>
        <span className="tag">Step 05</span>
      </div>
      <p className="step-sub">Configure glazing ratios, window dimensions and material selection. Cost and energy estimates update in real time.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 280px',gap:20,alignItems:'start'}}>
        <div>
          <div className="section-head"><span className="section-label">Facade elevation preview</span><div className="section-line"/></div>
          <div style={{display:'flex',gap:5,marginBottom:8}}>
            {['S','N','E','W'].map(f=>(
              <button key={f} className={`face-tab ${activeView===f?'active':''}`} onClick={()=>setActiveView(f)}>{f} face</button>
            ))}
          </div>
          <div className="canvas-facade-wrap">
            <canvas ref={canvasRef} width={400} height={400} style={{width:'100%',height:'100%'}} />
          </div>
        </div>

        <div>
          <div className="section-head"><span className="section-label">Glazing ratios by facade</span><div className="section-line"/></div>
          <div className="card-white" style={{marginBottom:14}}>
            {[{face:'South',val:glassS,set:setGlassS,rec:55},{face:'North',val:glassN,set:setGlassN,rec:30},{face:'East',val:glassE,set:setGlassE,rec:45},{face:'West',val:glassW,set:setGlassW,rec:35}].map(f=>(
              <div key={f.face} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,color:'var(--ink-mid)'}}>{f.face}</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>rec {f.rec}%</span>
                    <span style={{fontSize:13,fontFamily:'var(--font-mono)',color:'var(--ink)',minWidth:34,textAlign:'right'}}>{f.val}%</span>
                  </div>
                </div>
                <input type="range" min="10" max="90" value={f.val} onChange={e=>f.set(+e.target.value)} style={{width:'100%'}} />
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Window dimensions</span><div className="section-line"/></div>
          <div className="card-white" style={{marginBottom:14}}>
            {[{l:'Window height (ft)',v:winH,set:setWinH,min:3,max:12,step:0.5},{l:'Window width (ft)',v:winW,set:setWinW,min:2,max:10,step:0.5},{l:'Mullion spacing (ft)',v:winSpacing,set:setWinSpacing,min:1,max:6,step:0.5}].map(s=>(
              <div key={s.l} className="slider-row" style={{marginBottom:10}}>
                <span className="slider-label" style={{minWidth:140,fontSize:11,color:'var(--ink-mid)'}}>{s.l}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.v} onChange={e=>s.set(+e.target.value)} />
                <span className="slider-val" style={{color:'var(--ink)'}}>{s.v} ft</span>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Material selection</span><div className="section-line"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div>
              <div style={{fontSize:9,color:'var(--ink-dim)',fontFamily:'var(--font-mono)',marginBottom:6,letterSpacing:'0.1em'}}>GLAZING TYPE</div>
              {Object.entries({standard:'Standard IGU',highPerf:'High-perf Low-E',triple:'Triple Glazed',electrochromic:'Electrochromic'}).map(([k,l])=>(
                <div key={k} className={`mat-opt ${glassType===k?'active':''}`} onClick={()=>setGlassType(k)}>
                  <span style={{fontSize:11}}>{l}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>${GLASS_COST[k]}/sf</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:9,color:'var(--ink-dim)',fontFamily:'var(--font-mono)',marginBottom:6,letterSpacing:'0.1em'}}>WALL PANEL</div>
              {Object.entries({concrete:'Precast Concrete',metalPanel:'Metal Panel',terracotta:'Terracotta',stone:'Stone Cladding'}).map(([k,l])=>(
                <div key={k} className={`mat-opt ${wallType===k?'active':''}`} onClick={()=>setWallType(k)}>
                  <span style={{fontSize:11}}>{l}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>${WALL_COST[k]}/sf</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="section-head"><span className="section-label">Cost estimate</span><div className="section-line"/></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div className="metric-chip"><div className="metric-chip-label">Total facade cost</div><div className="metric-chip-val" style={{fontSize:20}}>${(totalFacadeCost/1e6).toFixed(1)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Glazing only</div><div className="metric-chip-val">${(glassCost/1e6).toFixed(1)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Wall cladding</div><div className="metric-chip-val">${(wallCost/1e6).toFixed(1)}M</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Cost / sf facade</div><div className="metric-chip-val">${Math.round(totalFacadeCost/(totalGlassArea+totalWallArea||1))}/sf</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Annual energy</div><div className="metric-chip-val warn">${(annualEnergyCost/1000).toFixed(0)}K /yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Saving vs baseline</div><div className="metric-chip-val good">–${(energySaving/1000).toFixed(0)}K /yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Avg glazing ratio</div><div className="metric-chip-val">{Math.round((glassN+glassS+glassE+glassW)/4)}%</div></div>
            {Object.entries(facadeAreas).map(([face,a])=>(
              <div key={face} style={{background:'var(--bg-white)',borderRadius:6,padding:'8px 10px',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:10,color:'var(--ink-mid)'}}>{face} face</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink)'}}>{Math.round(a.glass).toLocaleString()} sf glass</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:glassRatios[face]+'%',background:face==='S'?'var(--gold)':'var(--accent)'}} />
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="btn-ghost" onClick={onBack} style={{flex:1}}>← Back</button>
            <button className="btn-primary" onClick={onNext} style={{flex:1}}>Export →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
