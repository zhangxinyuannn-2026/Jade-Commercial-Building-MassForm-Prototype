import React, { useState, useMemo } from 'react'
import './Step4Solar.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function getSunData(lat=40.7){return MONTHS.map((m,i)=>{const dec=23.45*Math.sin((360/365*(284+(i+1)*30.5-15))*Math.PI/180);return{month:m,maxAlt:Math.max(0,90-lat+dec).toFixed(1),dayLength:Math.max(0,12+2.5*Math.sin((i-2.5)/12*2*Math.PI)).toFixed(1)}})}

const FACING_DATA = {
  N:{solar:'Low',glare:'None',heatLoad:'High',coolLoad:'Low',esg:'C',rec:'Minimise glazing. Use for stairs, toilets, back-of-house. North-facing offices need supplemental artificial lighting.'},
  NE:{solar:'Low–Morning',glare:'Morning',heatLoad:'Med',coolLoad:'Low',esg:'B',rec:'Morning light suits east workspaces. Keep north glazing ratio below 35%.'},
  E:{solar:'Morning',glare:'Morning',heatLoad:'Med',coolLoad:'Med',esg:'B+',rec:'Morning solar gain — ideal for café, lobby. Shade with vertical fins.'},
  SE:{solar:'High',glare:'Moderate',heatLoad:'Low',coolLoad:'High',esg:'A',rec:'Excellent winter solar gain. Add horizontal shading 30–45° to block summer sun. Best orientation for office floor plates.'},
  S:{solar:'Peak',glare:'High',heatLoad:'Low',coolLoad:'Very High',esg:'A+',rec:'Maximum solar exposure. Deep overhangs required (min 3ft). Best facade for PV panels. Pair with external blinds.'},
  SW:{solar:'Afternoon',glare:'Afternoon',heatLoad:'Low',coolLoad:'High',esg:'A',rec:'Afternoon heat gain — critical in summer. Use vertical louvers or electrochromic glazing.'},
  W:{solar:'Afternoon',glare:'Severe PM',heatLoad:'Low',coolLoad:'Very High',esg:'B',rec:'Worst face for summer cooling loads. Use perforated metal screens or deep reveals.'},
  NW:{solar:'Low',glare:'Evening',heatLoad:'Med',coolLoad:'Low',esg:'B-',rec:'Low solar, high wind exposure in many climates. Good for parking, storage, MEP plant.'},
}
const MASSING_RECS=[
  {id:'slab',label:'N–S Slab',desc:'Long axis N–S. East + west offices; min. south exposure.',esg:'B+',icon:'▬'},
  {id:'rotated',label:'45° Rotated',desc:'Corners face cardinal directions — equal solar exposure all faces.',esg:'B',icon:'◆'},
  {id:'se-oriented',label:'SE-optimised',desc:'Long face SE. Max winter gain, min summer overheating.',esg:'A',icon:'◈'},
  {id:'solar-step',label:'Solar Stepping',desc:'Upper floors step back on south face — self-shading below.',esg:'A+',icon:'⊏'},
]
const ESG_HVAC = {'A+':{pct:32,savPerSf:0.55},'A':{pct:24,savPerSf:0.40},'B+':{pct:15,savPerSf:0.25},'B':{pct:10,savPerSf:0.16},'B-':{pct:5,savPerSf:0.08},'C':{pct:0,savPerSf:0}}

export default function Step4Solar({state,update,onNext,onBack}){
  const [selectedFacing, setSelectedFacing] = useState(state.orientation||'S')
  const [selectedMassing, setSelectedMassing] = useState('se-oriented')
  const sunData = useMemo(()=>getSunData(),[])
  const facing  = FACING_DATA[selectedFacing]||FACING_DATA['S']

  // Pull programme data
  const programs  = state.selectedPrograms || []
  const totalSF   = programs.reduce((s,p)=>s+(p.sf||0),0) || 50000
  const envW      = (state.lotW||120)-(state.sideSB||10)*2
  const envD      = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors    = Math.max(1,Math.round(totalSF/(envW*envD)))
  const perimFt   = 2*(envW+envD)
  const facadeArea= perimFt * floors * 14

  // Facade costs already computed in Step4 (Facade) and stored in state
  const facadeCostTotal   = state.facadeCostTotal   || 0
  const annualEnergyCost  = state.annualEnergyCost  || Math.round(totalSF*4.50)
  const annualEnergySaving= state.annualEnergySaving|| 0
  const glassType         = state.glassType || 'highPerf'
  const avgGlass = Math.round(((state.glassRatioS||0.55)+(state.glassRatioN||0.30)+(state.glassRatioE||0.45)+(state.glassRatioW||0.35))/4*100)

  // ESG orientation saving (on top of facade saving already computed)
  const hvac = ESG_HVAC[facing.esg]||{pct:10,savPerSf:0.16}
  const orientationSaving = Math.round(totalSF * (hvac.savPerSf || 0))
  const totalAnnualSaving = annualEnergySaving + orientationSaving

  // LEED rating estimate
  const leedRating = facing.esg==='A+'||facing.esg==='A' ? (glassType==='electrochromic'||glassType==='triple' ? 'Platinum' : 'Gold') : facing.esg.startsWith('B') ? 'Silver' : 'Certified'

  // Programme energy profile
  const officeSF    = programs.filter(p=>p.category==='workspace'||['open-office','flex-workspace','hybrid-workspace'].includes(p.id)).reduce((s,p)=>s+(p.sf||0),0)
  const amenitySF   = programs.filter(p=>['amenity','retail'].includes(p.category)).reduce((s,p)=>s+(p.sf||0),0)
  const officePct   = totalSF>0 ? Math.round(officeSF/totalSF*100) : 0

  return(
    <div className="step-wrap" style={{maxWidth:1000}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Solar & <em>ESG.</em></h1>
        <span className="tag">Step 05</span>
      </div>
      <p className="step-sub">
        Annual sun exposure analysis by facade orientation. Recommendations are layered on top of your facade design choices from Step 4 — costs shown include both facade specification and orientation savings.
      </p>

      {/* Cost carry-over banner */}
      {facadeCostTotal > 0 && (
        <div style={{background:'var(--accent-light)',border:'1px solid rgba(44,106,79,0.25)',borderRadius:'var(--r-md)',padding:'10px 14px',marginBottom:18,display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:11,color:'var(--accent)',fontFamily:'var(--font-mono)'}}>FROM FACADE STEP →</span>
          <span style={{fontSize:12,color:'var(--ink-mid)'}}>Facade: <strong>${(facadeCostTotal/1e6).toFixed(2)}M</strong></span>
          <span style={{fontSize:12,color:'var(--ink-mid)'}}>Annual energy: <strong>${(annualEnergyCost/1000).toFixed(0)}K/yr</strong></span>
          <span style={{fontSize:12,color:'var(--accent)'}}>Facade saving: <strong>–${(annualEnergySaving/1000).toFixed(0)}K/yr</strong></span>
          <span style={{fontSize:11,color:'var(--ink-dim)',fontFamily:'var(--font-mono)'}}>{avgGlass}% avg glazing · {state.glassType}</span>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        {/* Left column */}
        <div>
          <div className="section-head"><span className="section-label">Annual sun altitude — NYC / lat 40.7°N</span><div className="section-line"/></div>
          <div className="card-white" style={{marginBottom:16}}>
            <div className="sun-chart">
              {sunData.map(d=>(
                <div key={d.month} className="sun-bar-col">
                  <div className="sun-bar-wrap"><div className="sun-bar" style={{height:Math.max(4,d.maxAlt/80*100)+'%'}}/></div>
                  <div className="sun-bar-label">{d.month}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>Winter solstice: 26°</span>
              <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>Summer solstice: 73°</span>
            </div>
          </div>

          <div className="section-head"><span className="section-label">Primary facade orientation</span><div className="section-line"/></div>
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
              {[{l:'Solar gain',v:facing.solar},{l:'Glare risk',v:facing.glare},{l:'Heating load',v:facing.heatLoad},{l:'Cooling load',v:facing.coolLoad}].map(x=>(
                <div key={x.l} style={{background:'var(--bg-panel)',borderRadius:5,padding:'7px 9px',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:9,color:'var(--ink-dim)',fontFamily:'var(--font-mono)',marginBottom:2}}>{x.l.toUpperCase()}</div>
                  <div style={{fontSize:11,color:'var(--ink)'}}>{x.v}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:12,color:'var(--ink-mid)',lineHeight:1.6}}>{facing.rec}</p>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="section-head"><span className="section-label">Massing orientation strategies</span><div className="section-line"/></div>
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
            {MASSING_RECS.map(m=>(
              <div key={m.id} className={`massing-rec ${selectedMassing===m.id?'active':''}`} onClick={()=>setSelectedMassing(m.id)}>
                <span style={{fontSize:18,color:'var(--ink-mid)'}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{m.label}</div>
                  <div style={{fontSize:11,color:'var(--ink-dim)',lineHeight:1.4}}>{m.desc}</div>
                </div>
                <span className={`esg-badge esg-${m.esg.replace('+','p').replace('-','m')}`}>ESG {m.esg}</span>
              </div>
            ))}
          </div>

          <div className="section-head"><span className="section-label">Combined ESG + cost summary</span><div className="section-line"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
            <div className="metric-chip"><div className="metric-chip-label">HVAC saving (orientation)</div><div className="metric-chip-val good">–{hvac.pct}%</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Orientation saving</div><div className="metric-chip-val good">–${(orientationSaving/1000).toFixed(0)}K/yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Total annual saving</div><div className="metric-chip-val good">–${(totalAnnualSaving/1000).toFixed(0)}K/yr</div></div>
            <div className="metric-chip"><div className="metric-chip-label">LEED est. rating</div><div className="metric-chip-val warn">{leedRating}</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Facade area</div><div className="metric-chip-val">{facadeArea.toLocaleString()} sf</div></div>
            <div className="metric-chip"><div className="metric-chip-label">Office % of programme</div><div className="metric-chip-val">{officePct}%</div></div>
          </div>

          <div className="card-white">
            <div className="section-label" style={{marginBottom:10}}>Recommended glazing ratios (from Step 4)</div>
            {[
              {face:'South',rec:55,note:'With horizontal shading',cur:Math.round((state.glassRatioS||0.55)*100)},
              {face:'North',rec:30,note:'Diffuse only — min heat loss',cur:Math.round((state.glassRatioN||0.30)*100)},
              {face:'East', rec:45,note:'Morning — vertical fins',cur:Math.round((state.glassRatioE||0.45)*100)},
              {face:'West', rec:35,note:'Limit PM heat gain',cur:Math.round((state.glassRatioW||0.35)*100)},
            ].map(f=>(
              <div key={f.face} style={{marginBottom:9}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,color:'var(--ink-mid)'}}>{f.face}</span>
                  <div style={{display:'flex',gap:8,alignItems:'baseline'}}>
                    <span style={{fontSize:9,color:'var(--ink-ghost)',fontFamily:'var(--font-mono)'}}>rec {f.rec}%</span>
                    <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:Math.abs(f.cur-f.rec)>12?'var(--gold)':'var(--accent)'}}>{f.cur}%</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:f.cur+'%',background:f.face==='South'?'var(--gold)':f.face==='West'?'var(--red)':'var(--accent)'}}/>
                </div>
                <div style={{fontSize:9,color:'var(--ink-ghost)',marginTop:2}}>{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>Export Study →</button>
      </div>
    </div>
  )
}
