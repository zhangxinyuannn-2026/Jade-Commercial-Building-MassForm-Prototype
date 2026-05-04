import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { CIRCULATION_TYPES } from '../data/programs.js'
import './Step3Massing.css'

const MASSING_TYPES = [
  {id:'box',label:'Box',icon:'▬'},
  {id:'taper',label:'Taper',icon:'▲'},
  {id:'step',label:'Stepped',icon:'⊏'},
  {id:'solar',label:'Solar-cut',icon:'◈'},
  {id:'podium',label:'Podium+Tower',icon:'⊓'},
]
const SCALE = 0.055
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getSunAlt(h, m) {
  const dec = 23.45 * Math.sin((360/365*(284+m*30.5-15))*Math.PI/180)
  const ha = (h-12)*15
  const sinAlt = Math.sin(40.7*Math.PI/180)*Math.sin(dec*Math.PI/180)+
    Math.cos(40.7*Math.PI/180)*Math.cos(dec*Math.PI/180)*Math.cos(ha*Math.PI/180)
  return Math.asin(sinAlt)*180/Math.PI
}

// North arrow SVG
function NorthArrow({ orientation }) {
  const dirs = {N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315}
  const rot = dirs[orientation]||0
  return (
    <div className="north-arrow">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <g transform={`rotate(${rot},18,18)`}>
          <polygon points="18,4 22,18 18,15 14,18" fill="var(--accent)" />
          <polygon points="18,32 22,18 18,21 14,18" fill="var(--ink-ghost)" />
          <circle cx="18" cy="18" r="2.5" fill="var(--accent)" />
        </g>
        <text x="18" y="36" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="var(--ink-dim)">N</text>
      </svg>
    </div>
  )
}

export default function Step3Massing({ state, update, onNext, onBack }) {
  const canvasRef = useRef(null)
  const sceneRef  = useRef({})
  const [massingType, setMassingType]   = useState(state.massingType||'box')
  const [taperPct, setTaperPct]         = useState(state.taperPct||0.6)
  const [stepCount, setStepCount]       = useState(state.stepCount||3)
  const [podiumFloors, setPodiumFloors] = useState(3)
  const [sunShow, setSunShow]           = useState(false)
  const [sunHour, setSunHour]           = useState(12)
  const [sunMonth, setSunMonth]         = useState(6)
  const [moduleMode, setModuleMode]     = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)

  const programs = state.selectedPrograms || []
  const totalSF  = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA   = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW     = (state.lotW||120)-(state.sideSB||10)*2
  const envD     = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const farUsed  = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)
  const floors   = Math.max(1,Math.round(totalSF/(envW*envD)))
  const totalH   = floors*14
  const circirc  = CIRCULATION_TYPES.find(c=>c.id===state.circulationType)

  useEffect(()=>{
    const canvas = canvasRef.current; if (!canvas) return
    const wrap   = canvas.parentElement
    const W = wrap.clientWidth, H = wrap.clientHeight

    const renderer = new THREE.WebGLRenderer({canvas,antialias:true})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.setSize(W,H)
    renderer.setClearColor(0xb8cdd8,1)
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    const fog = new THREE.FogExp2(0xc2d4e3,0.008)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(42,W/H,0.1,600)
    camera.position.set(22,18,28); camera.lookAt(0,6,0)

    scene.add(new THREE.AmbientLight(0xd0e4f0,0.9))
    const sun = new THREE.DirectionalLight(0xfff5e0,1.2)
    sun.position.set(12,28,14); sun.castShadow=true
    sun.shadow.mapSize.set(2048,2048)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xe8f4ff,0.35)
    fill.position.set(-8,4,-8); scene.add(fill)

    // Ground — light concrete look
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(120,120),
      new THREE.MeshLambertMaterial({color:0xa8bfd0}))
    gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; scene.add(gnd)
    scene.add(new THREE.GridHelper(120,60,0x8aaabf,0x8aaabf))

    const buildingGroup = new THREE.Group()
    const envelopeGroup = new THREE.Group()
    const shadowGroup   = new THREE.Group()
    scene.add(envelopeGroup,buildingGroup,shadowGroup)

    sceneRef.current = {renderer,scene,camera,buildingGroup,envelopeGroup,shadowGroup,sun}

    // Orbit
    let drag=false, lx=0, ly=0, theta=0.6, phi=0.52, radius=34
    canvas.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY})
    window.addEventListener('mouseup',()=>{drag=false})
    window.addEventListener('mousemove',e=>{
      if (!drag) return
      theta -= (e.clientX-lx)*0.007
      phi = Math.max(0.1,Math.min(1.45,phi-(e.clientY-ly)*0.007))
      lx=e.clientX; ly=e.clientY
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.cos(theta))
      camera.lookAt(0,6,0)
    })
    canvas.addEventListener('wheel',e=>{
      radius=Math.max(10,Math.min(80,radius+e.deltaY*0.05))
      camera.position.setLength(radius)
    })

    const handleResize = ()=>{
      const W2=wrap.clientWidth,H2=wrap.clientHeight
      renderer.setSize(W2,H2); camera.aspect=W2/H2; camera.updateProjectionMatrix()
    }
    window.addEventListener('resize',handleResize)
    let animId
    const animate=()=>{animId=requestAnimationFrame(animate);renderer.render(scene,camera)}
    animate()
    return ()=>{window.removeEventListener('resize',handleResize);cancelAnimationFrame(animId);renderer.dispose()}
  },[])

  // Rebuild massing
  useEffect(()=>{
    const {buildingGroup,envelopeGroup,shadowGroup}=sceneRef.current
    if (!buildingGroup) return
    const clear=g=>{while(g.children.length)g.remove(g.children[0])}
    clear(buildingGroup); clear(envelopeGroup); clear(shadowGroup)

    const lw=(state.lotW||120)*SCALE, ld=(state.lotD||160)*SCALE
    const sbf=(state.frontSB||15)*SCALE, sbs=(state.sideSB||10)*SCALE, sbr=(state.rearSB||20)*SCALE
    const ew=lw-sbs*2, ed=ld-sbf-sbr, hMax=(state.heightMax||180)*SCALE
    const cy=(sbf-sbr)/2

    // Lot lines
    const addEdge=(geo,col,pos)=>{
      const m=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:col}))
      if(pos) m.position.copy(pos); envelopeGroup.add(m)
    }
    addEdge(new THREE.EdgesGeometry(new THREE.BoxGeometry(lw,0.01,ld)),0x7a9e85,new THREE.Vector3(0,0.005,0))
    addEdge(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew,0.01,ed)),0x2d6a4f,new THREE.Vector3(0,0.01,cy))

    // Envelope ghost — light semi-transparent
    const envMesh=new THREE.Mesh(new THREE.BoxGeometry(ew,hMax,ed),
      new THREE.MeshBasicMaterial({color:0x4a7055,transparent:true,opacity:0.06}))
    envMesh.position.set(0,hMax/2,cy); envelopeGroup.add(envMesh)
    const envWire=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew,hMax,ed)),
      new THREE.LineBasicMaterial({color:0x2d6a4f,transparent:true,opacity:0.22}))
    envWire.position.copy(envMesh.position); envelopeGroup.add(envWire)

    // Programs as modules
    const progs = programs.length>0 ? programs : [{label:'Office',color:'#3b82f6',sf:totalSF||5000,floorH:14}]

    if (moduleMode) {
      // MODULE MODE: each program gets its own proportioned 3D block
      // Subdivide envelope floor area proportionally
      const totalProgSF = progs.reduce((s,p)=>s+(p.sf||1000),0)
      let xOff = -ew/2
      const moduleH = Math.min(hMax*0.8, progs.length>1 ? hMax/progs.length*1.2 : hMax*0.6)

      progs.forEach((prog,i)=>{
        const frac = (prog.sf||1000)/totalProgSF
        const mw = Math.max(ew*0.2, ew*frac*1.5)
        const mh = (prog.floorH||14)*SCALE * Math.max(1, Math.floor((prog.sf||1000)/(envW*envD*0.3)))
        const col = new THREE.Color(prog.color||'#3b82f6')
        const geo = new THREE.BoxGeometry(Math.min(mw,ew*0.8), mh, ed*0.8)
        const mat = new THREE.MeshLambertMaterial({color:col})
        const mesh = new THREE.Mesh(geo,mat)
        // Stack vertically but offset slightly for visual separation
        const yBase = i*(hMax/progs.length)
        mesh.position.set(xOff*0.3, yBase+mh/2, cy+(i%2===0?0.2:-0.2))
        mesh.castShadow=true; buildingGroup.add(mesh)
        const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.3}))
        wire.position.copy(mesh.position); buildingGroup.add(wire)
      })
    } else {
      // STACKED MODE: programs fill full floor, vary by massing type
      let yOffset=0
      progs.forEach((prog,i)=>{
        const progH=(prog.floorH||13)*SCALE
        let fw=ew, fd=ed
        const t=i/Math.max(progs.length-1,1)
        if (massingType==='taper'){const f=1-(1-taperPct)*t;fw=ew*f;fd=ed*f}
        else if(massingType==='step'){const tier=Math.floor(i/Math.ceil(progs.length/stepCount));const s=Math.max(0.3,1-tier*(0.65/Math.max(stepCount-1,1)));fw=ew*s;fd=ed*s}
        else if(massingType==='solar'){const c=Math.max(0,t-0.35)*1.5;fw=ew*Math.max(0.4,1-c*0.4)}
        else if(massingType==='podium'){if(i<podiumFloors){fw=ew;fd=ed}else{fw=ew*0.55;fd=ed*0.7}}

        const col=new THREE.Color(prog.color||'#3b82f6')
        col.multiplyScalar(0.7+0.3*(1-t*0.35))
        const geo=new THREE.BoxGeometry(fw,progH*0.96,fd)
        const mat=new THREE.MeshLambertMaterial({color:col})
        const mesh=new THREE.Mesh(geo,mat)
        mesh.position.set(0,yOffset+progH/2,cy)
        mesh.castShadow=true; buildingGroup.add(mesh)
        const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.15}))
        wire.position.copy(mesh.position); buildingGroup.add(wire)
        yOffset+=progH
      })
    }

    // Shadow cast
    if (sunShow){
      const alt=getSunAlt(sunHour,sunMonth)
      if (alt>2){
        const az=(sunHour-6)/14*Math.PI
        const sl=(floors*14*SCALE)/Math.tan(alt*Math.PI/180)
        const sx=Math.sin(az)*sl, sz=Math.cos(az)*sl
        const sMesh=new THREE.Mesh(new THREE.PlaneGeometry(ew+Math.abs(sx)*0.3+0.5,ed+Math.abs(sz)*0.3+0.5),
          new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.18,depthWrite:false}))
        sMesh.rotation.x=-Math.PI/2; sMesh.position.set(sx*0.5,0.02,cy+sz*0.5)
        shadowGroup.add(sMesh)
      }
    }
  },[programs,massingType,taperPct,stepCount,podiumFloors,sunShow,sunHour,sunMonth,moduleMode,state])

  const setView=(v)=>{
    const {camera}=sceneRef.current; if(!camera) return
    if(v==='top'){camera.position.set(0,50,0.01);camera.lookAt(0,0,0)}
    else if(v==='south'){camera.position.set(0,14,38);camera.lookAt(0,10,0)}
    else if(v==='iso'){camera.position.set(22,18,28);camera.lookAt(0,6,0)}
  }

  return (
    <div className="step-full">
      <div className="canvas-area">
        <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block'}} />
        <div className="canvas-toolbar">
          <button className="tool-btn" onClick={()=>setView('iso')}>Isometric</button>
          <button className="tool-btn" onClick={()=>setView('top')}>Top</button>
          <button className="tool-btn" onClick={()=>setView('south')}>South</button>
          <button className={`tool-btn ${sunShow?'sun-on':''}`} onClick={()=>setSunShow(v=>!v)}>☀ Sun</button>
          <button className={`tool-btn ${moduleMode?'sun-on':''}`} onClick={()=>setModuleMode(v=>!v)}>
            {moduleMode?'◈ Module':'▬ Stack'} mode
          </button>
        </div>

        {sunShow && (
          <div className="sun-panel">
            <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--gold)',letterSpacing:'0.1em',marginBottom:10}}>SUN ANALYSIS</div>
            <div className="slider-row" style={{marginBottom:8}}>
              <span className="slider-label" style={{color:'var(--ink-mid)'}}>Hour</span>
              <input type="range" min="6" max="20" value={sunHour} onChange={e=>setSunHour(+e.target.value)} />
              <span className="slider-val" style={{color:'var(--ink)'}}>{sunHour}:00</span>
            </div>
            <div className="slider-row" style={{marginBottom:10}}>
              <span className="slider-label" style={{color:'var(--ink-mid)'}}>Month</span>
              <input type="range" min="1" max="12" value={sunMonth} onChange={e=>setSunMonth(+e.target.value)} />
              <span className="slider-val" style={{color:'var(--ink)'}}>{MONTHS[sunMonth-1]}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {[
                {l:'Altitude',v:Math.max(0,getSunAlt(sunHour,sunMonth)).toFixed(0)+'°'},
                {l:'Shadow',v:getSunAlt(sunHour,sunMonth)>0?Math.round(totalH/Math.tan(getSunAlt(sunHour,sunMonth)*Math.PI/180))+' ft':'∞'},
              ].map(x=>(
                <div key={x.l} style={{background:'var(--bg-panel)',borderRadius:5,padding:'7px 8px',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:9,color:'var(--ink-dim)',fontFamily:'var(--font-mono)'}}>{x.l}</div>
                  <div style={{fontSize:13,fontFamily:'var(--font-mono)',color:'var(--gold)',fontWeight:500}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="canvas-info">
          <span>{state.projectName||'Study'}</span>
          <span style={{color:'var(--ink-ghost)'}}>|</span>
          <span>{Math.round(totalH)} ft · {programs.length} programs</span>
          <span style={{color:'var(--ink-ghost)'}}>|</span>
          <span style={{color:+farUsed>state.farMax?'var(--red)':'var(--accent)'}}>FAR {farUsed}</span>
          <span style={{color:'var(--ink-ghost)'}}>|</span>
          <span style={{color:'var(--ink-light)'}}>{moduleMode?'MODULE MODE':'STACK MODE'}</span>
        </div>

        <NorthArrow orientation={state.orientation||'N'} />
      </div>

      {/* Sidebar */}
      <div className="side-pane" style={{background:'var(--bg-panel)'}}>
        {/* Metrics */}
        <div className="card-white">
          <div className="section-label" style={{marginBottom:8}}>Area schedule</div>
          {[
            {l:'Total GFA',v:totalSF.toLocaleString()+' sf',cls:totalSF>maxGFA?'bad':'good'},
            {l:'FAR used',v:farUsed+' / '+state.farMax,cls:+farUsed>state.farMax?'bad':''},
            {l:'Est. floors',v:floors},
            {l:'Total height',v:Math.round(totalH)+' ft'},
          ].map(m=>(
            <div key={m.l} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:11,color:'var(--ink-dim)'}}>{m.l}</span>
              <span style={{fontSize:12,fontFamily:'var(--font-mono)',color:m.cls==='good'?'var(--accent)':m.cls==='bad'?'var(--red)':'var(--ink)'}}>{m.v}</span>
            </div>
          ))}
          <div className="progress-track">
            <div className="progress-fill" style={{width:Math.min(100,totalSF/maxGFA*100)+'%',background:'var(--accent)'}} />
          </div>
        </div>

        {/* Massing type */}
        <div>
          <div className="section-head"><span className="section-label">Massing type</span><div className="section-line" /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:8}}>
            {MASSING_TYPES.map(mt=>(
              <div key={mt.id} className={`massing-opt ${massingType===mt.id?'active':''}`}
                onClick={()=>{setMassingType(mt.id);update({massingType:mt.id})}}>
                <span style={{fontSize:14}}>{mt.icon}</span>
                <span style={{fontSize:11}}>{mt.label}</span>
              </div>
            ))}
          </div>
          {massingType==='taper' && (
            <div className="slider-row">
              <span className="slider-label">Top %</span>
              <input type="range" min="10" max="100" value={Math.round(taperPct*100)}
                onChange={e=>{setTaperPct(e.target.value/100);update({taperPct:e.target.value/100})}} />
              <span className="slider-val">{Math.round(taperPct*100)}%</span>
            </div>
          )}
          {massingType==='step' && (
            <div className="slider-row">
              <span className="slider-label">Steps</span>
              <input type="range" min="2" max="6" step="1" value={stepCount}
                onChange={e=>{setStepCount(+e.target.value);update({stepCount:+e.target.value})}} />
              <span className="slider-val">{stepCount}</span>
            </div>
          )}
          {massingType==='podium' && (
            <div className="slider-row">
              <span className="slider-label">Podium fls</span>
              <input type="range" min="1" max="6" step="1" value={podiumFloors} onChange={e=>setPodiumFloors(+e.target.value)} />
              <span className="slider-val">{podiumFloors}</span>
            </div>
          )}
        </div>

        {/* Module mode info */}
        <div className="card-white">
          <div className="section-label" style={{marginBottom:6}}>Program modules</div>
          <p style={{fontSize:11,color:'var(--ink-dim)',lineHeight:1.5,marginBottom:8}}>
            {moduleMode
              ? 'Module mode: each program rendered as an independent 3D volume. Proportions reflect relative floor area.'
              : 'Stack mode: programs fill each floor. Switch to Module mode to see individual volumes.'}
          </p>
          <button className={`tool-btn ${moduleMode?'sun-on':''}`} style={{width:'100%',padding:'7px',fontSize:11,borderRadius:'var(--r-sm)',border:'1px solid var(--border-mid)',background:'var(--bg-white)',color:'var(--ink-mid)'}}
            onClick={()=>setModuleMode(v=>!v)}>
            {moduleMode?'▬ Switch to Stack mode':'◈ Switch to Module mode'}
          </button>
        </div>

        {/* Program list */}
        <div>
          <div className="section-head"><span className="section-label">Program stack</span><div className="section-line" /></div>
          <div style={{display:'flex',flexDirection:'column',gap:3}}>
            {programs.map((prog,i)=>(
              <div key={prog.id} className="prog-stack-row" style={{borderLeft:`3px solid ${prog.color}`}}>
                <span style={{fontSize:11,flex:1,color:'var(--ink)'}}>{prog.label}</span>
                <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>{(prog.sf||prog.defaultSF||0).toLocaleString()} sf</span>
                <span style={{fontSize:9,color:'var(--ink-ghost)'}}>{prog.floorH}ft</span>
              </div>
            ))}
          </div>
        </div>

        {circirc && (
          <div className="card-white">
            <div className="section-label" style={{marginBottom:5}}>Circulation</div>
            <div style={{fontSize:12,fontWeight:500,color:'var(--ink)',marginBottom:2}}>{circirc.label}</div>
            <div style={{fontSize:11,color:'var(--ink-dim)'}}>Efficiency: {Math.round(circirc.efficiencyRatio*100)}%</div>
            <div style={{fontSize:11,color:'var(--ink-dim)'}}>Net: {Math.round(totalSF*circirc.efficiencyRatio).toLocaleString()} sf</div>
          </div>
        )}

        <div style={{display:'flex',gap:8,marginTop:'auto'}}>
          <button className="btn-ghost" onClick={onBack} style={{flex:1}}>← Back</button>
          <button className="btn-primary" onClick={onNext} style={{flex:2}}>Solar Analysis →</button>
        </div>
      </div>
    </div>
  )
}
