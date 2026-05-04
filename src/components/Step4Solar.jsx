import React, { useState, useMemo } from 'react'
import './Step4Solar.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function getSunData(lat=40.7){return MONTHS.map((m,i)=>{const dec=23.45*Math.sin((360/365*(284+(i+1)*30.5-15))*Math.PI/180);const maxAlt=90-lat+dec;const dayL=Math.max(0,12+2.5*Math.sin((i-2.5)/12*2*Math.PI));return{month:m,maxAlt:maxAlt.toFixed(1),dayLength:dayL.toFixed(1)}})}

const FACING_DATA = {
  N:{solar:'low',glare:'none',heating:'high',cooling:'low',esg:'C',rec:'Minimise glazing. Use for stairs, toilets, back-of-house. North-facing offices need supplemental artificial lighting.'},
  NE:{solar:'low-morning',glare:'morning',heating:'medium',cooling:'low',esg:'B',rec:'Morning light good for east-facing workspaces. Limit glazing on north side.'},
  E:{solar:'morning',glare:'morning',heating:'medium',cooling:'medium',esg:'B+',rec:'Morning solar gain — ideal for café, lobby. Shade with vertical fins to control glare.'},
  SE:{solar:'high',glare:'moderate',heating:'low',cooling:'high',esg:'A',rec:'Excellent winter solar gain. Add horizontal shading 30–45° to block summer sun. Best for office floor plates.'},
  S:{solar:'peak',glare:'high',heating:'low',cooling:'very-high',esg:'A+',rec:'Maximum solar exposure. Deep overhangs (min 3ft) required. Best facade for PV panels. Pair with external blinds.'},
  SW:{solar:'afternoon',glare:'afternoon',heating:'low',cooling:'high',esg:'A',rec:'Afternoon heat gain — critical in summer. Use vertical louvers or electrochromic glazing.'},
  W:{solar:'afternoon',glare:'severe-pm',heating:'low',cooling:'very-high',esg:'B',rec:'Worst for summer cooling loads. Use perforated metal screens or deep reveals if west-facing.'},
  NW:{solar:'low',glare:'evening',heating:'medium',cooling:'low',esg:'B-',rec:'Low solar, high wind exposure in many climates. Good for parking, storage, MEP plant.'},
}
const MASSING_RECS=[
  {id:'slab',label:'N–S Slab',desc:'Long axis N–S maximizes east + west glazing.',esg:'B+',icon:'▬'},
  {id:'rotated',label:'45° Rotated',desc:'Corners face cardinal directions — equal exposure.',esg:'B',icon:'◆'},
  {id:'se-oriented',label:'SE-optimised',desc:'Long face SE. Max winter gain, min summer overheating.',esg:'A',icon:'◈'},
  {id:'solar-step',label:'Solar Stepping',desc:'Upper floors step back on south face, self-shading below.',esg:'A+',icon:'⊏'},
]
const HVAC={
  'A+':{pct:32,cost:18},'A':{pct:24,cost:13},
  'B+':{pct:15,cost:8},'B':{pct:10,cost:5},'B-':{pct:5,cost:3},'C':{pct:0,cost:0}
}

export default function Step4Solar({state,update,onNext,onBack}){
  const [selectedFacing,setSelectedFacing]=useState(state.orientation||'S')
  const [selectedMassing,setSelectedMassing]=useState('se-oriented')
  const sunData=useMemo(()=>getSunData(),[])
  const facing=FACING_DATA[selectedFacing]||FACING_DATA['S']
  const programs=state.selectedPrograms||[]
  const totalSF=programs.reduce((s,p)=>s+(p.sf||0),0)
  const envW=(state.lotW||120)-(state.sideSB||10)*2
  const envD=(state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors=Math.max(1,Math.round(totalSF/(envW*envD)))
  const perimFt=2*(envW+envD)
  const facadeArea=perimFt*floors*14
  const hvac=HVAC[facing.esg]||{pct:10,cost:5}
  const annualSaving=Math.round(hvac.cost*facadeArea/1000)

  return(
    <div className="step-wrap" style={{maxWidth:1000}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Solar & <em>ESG.</em></h1>
        <span className="tag">Step 04</span>
      </div>
      <p className="step-sub">Analyse annual sun exposure by facing direction. Recommendations optimise for HVAC cost savings and LEED/ESG performance.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div>
          <div className="section-head"><span className="section-label">Annual sun altitude — NYC lat 40.7°</span><div className="section-line"/></div>
          <div className="card-white" style={{marginBottom:16}}>
            <div className="sun-chart">
              {sunData.map(d=>(
                <div key={d.month} className="sun-bar-col">
                  <div className="sun-bar-wrap"><div className="sun-bar" style={{height:Math.max(4,d.maxAlt/80*100)+'%'}}/></div>
                  <div className="sun-bar-label">{d.month}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
              <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>Winter: 26° max</span>
              <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>Summer: 73° max</span>
            </div>
          </div>

          <div className="section-head"><span className="section-label">Primary facade facing</span><div className="section-line"/></div>
          <div className="facing-grid" style={{marginBottom:12}}>
            {Object.entries(FACING_DATA).map(([dir,data])=>(
              <div key={dir} className={`facing-card ${selectedFacing===dir?'active':''}`} onClick={()=>setSelectedFacing(dir)}>
                <div className="facing-dir">{dir}</div>
                <div className={`facing-esg esg-${data.esg.replace('+','p').replace('-','m')}`}>{data.esg}</div>
              </div>
            ))}
          </div>

          <div className="card-white">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{selectedFacing}-facing analysis</span>
              <span className={`esg-badge esg-${facing.esg.replace('+','p').replace('-','m')}`}>ESG {facing.esg}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:10}}>
              {[{l:'Solar gain',v:facing.solar},{l:'Glare risk',v:facing.glare},{l:'Heating load',v:facing.heating},{l:'Cooling load',v:facing.cooling}].map(x=>(
                <div key={x.l} style={{background:'var(--bg-panel)',borderRadius:5,padding:'7px 9px',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:9,color:'var(--ink-dim)',fontFamily:'var(--font-mono)',marginBottom:2}}>{x.l.toUpperCase()}</div>
                  <div style={{fontSize:11,color:'var(--ink)',textTransform:'capitalize'}}>{x.v}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:12,color:'var(--ink-mid)',lineHeight:1.6}}>{facing.rec}</p>
          </div>
        </div>

        <div>
          <div className="section-head"><span className="section-label">Massing orientation strategies</span><div className="section-line"/></div>
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
            {MASSING_RECS.map(m=>(
              <div key={m.id} className={`massing-rec ${selectedMassing===m.id?'active':''}`} onClick={()=>setSelectedMassing(m.id)}>
                <span style={{fontSize:20}}>{m.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{m.label}</div><div style={{fontSize:11,color:'var(--ink-dim)',lineHeight:1.4}}>{m.desc}</div></div>
                <span className={`esg-badge esg-${m.esg.replace('+','p').replace('-','m')}`}>ESG {m.esg}</span>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">ESG & cost impact</span><div className="section-line"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
            <div className="metric-chip"><div className="metric-chip-label">HVAC saving</div><div className="metric-chip-val good">–{hvac.pct}%</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Est. annual saving</div><div className="metric-chip-val good">${annualSaving}K /yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Facade area</div><div className="metric-chip-val">{facadeArea.toLocaleString()} sf</div></div>
            <div className="metric-chip"><div className="metric-chip-label">LEED target</div><div className="metric-chip-val warn">{facing.esg==='A+'?'Platinum':facing.esg==='A'?'Gold':facing.esg.startsWith('B')?'Silver':'Certified'}</div></div>
          </div>

          <div className="card-white">
            <div className="section-label" style={{marginBottom:10}}>Recommended glass-to-wall ratio</div>
            {[{face:'South',rec:55,note:'With external shading'},{face:'North',rec:30,note:'Diffuse, min heat loss'},{face:'East',rec:45,note:'Morning, vertical fins'},{face:'West',rec:35,note:'Limit PM heat gain'}].map(f=>(
              <div key={f.face} style={{marginBottom:9}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,color:'var(--ink-mid)'}}>{f.face}</span>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--ink)'}}>{f.rec}% — {f.note}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:f.rec+'%',background:f.face==='South'?'var(--gold)':'var(--accent)'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>Facade Design →</button>
      </div>
    </div>
  )
}
