import React, { useRef, useEffect, useState, useCallback } from 'react'
import './Step3Massing.css'

// ── MASSING TYPOLOGIES ──────────────────────────────────────────────────────
// Each typology has multiple architecturally-grounded variants
// Inspired by: SOM, KPF, BIG, Heatherwick, Rogers Stirk Harbour, MVRDV

const TYPOLOGIES = [
  { id:'box',      label:'Box / Slab',     icon:'▬', desc:'Regular extruded volume with core variations' },
  { id:'taper',    label:'Taper / Spire',  icon:'▲', desc:'Upper floors reduce — light access, sky exposure' },
  { id:'stepped',  label:'Stepped',        icon:'⊏', desc:'Setback tiers with sky terraces at each step' },
  { id:'courtyard',label:'Courtyard',      icon:'◻', desc:'Central void — light wells, atrium, garden' },
  { id:'cluster',  label:'Cluster / Split',icon:'◈', desc:'Two or more volumes linked by bridges or podium' },
]

// Architecturally-grounded variants per typology (section profiles as % data)
// Each variant: { name, ref, sections: [{w,x,label,color,floors}], note }
function generateVariants(typologyId, params) {
  const { envW, envD, maxFloors, totalSF, programs, lotW, lotD } = params
  const variants = VARIANT_LIBRARY[typologyId] || []
  // Inject actual programme colors into first program slots
  return variants.map((v,vi) => ({
    ...v,
    variantIndex: vi,
    typologyId,
    envW, envD, maxFloors, totalSF, programs, lotW, lotD,
  }))
}

// ── VARIANT LIBRARY ──────────────────────────────────────────────────────────
const VARIANT_LIBRARY = {
  box: [
    {
      name:'Central Core',
      ref:'Seagram Building typology — Mies van der Rohe',
      note:'Core centred, equal perimeter offices on all sides. Maximum efficiency.',
      sectionProfile:[
        {xPct:0,wPct:1.0,label:'Office',floors:1.0,colorKey:'office'},
      ],
      planType:'central-core',
    },
    {
      name:'End Core',
      ref:'Lever House typology — SOM',
      note:'Core at north end frees south facade for high-performance glazing.',
      sectionProfile:[
        {xPct:0,wPct:1.0,label:'Office',floors:0.92,colorKey:'office'},
        {xPct:0,wPct:0.18,label:'Core',floors:1.0,colorKey:'core'},
      ],
      planType:'end-core',
    },
    {
      name:'Podium + Shaft',
      ref:'30 Hudson Yards — KPF',
      note:'Wide podium base (retail/amenity) + slender tower shaft. Urban street presence.',
      sectionProfile:[
        {xPct:0,wPct:1.0,label:'Amenity Podium',floors:0.18,colorKey:'amenity'},
        {xPct:0.15,wPct:0.7,label:'Office Shaft',floors:0.82,colorKey:'office'},
      ],
      planType:'podium-shaft',
    },
    {
      name:'Dual-Band',
      ref:'Shard typology — Renzo Piano',
      note:'Horizontal programme bands visible in section. Trading / office / mechanical clearly expressed.',
      sectionProfile:[
        {xPct:0,wPct:1.0,label:'Retail/Lobby',floors:0.1,colorKey:'retail'},
        {xPct:0,wPct:1.0,label:'Trading/Finance',floors:0.2,colorKey:'highlight'},
        {xPct:0,wPct:1.0,label:'Office',floors:0.55,colorKey:'office'},
        {xPct:0.1,wPct:0.8,label:'Mechanical/Amenity',floors:0.08,colorKey:'mech'},
        {xPct:0.3,wPct:0.4,label:'Crown/Plant',floors:0.07,colorKey:'rooftop'},
      ],
      planType:'central-core',
    },
  ],
  taper: [
    {
      name:'Classic Taper',
      ref:'Empire State / Chrysler stepping — Art Deco tradition',
      note:'Gradual reduction from base to crown. Maximum FAR at lower floors.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Podium', floors:0.15, colorKey:'retail'},
        {xPct:0.05, wPct:0.9,  label:'Office', floors:0.35, colorKey:'office'},
        {xPct:0.12, wPct:0.76, label:'Office', floors:0.25, colorKey:'office2'},
        {xPct:0.22, wPct:0.56, label:'Office', floors:0.18, colorKey:'office'},
        {xPct:0.35, wPct:0.3,  label:'Crown',  floors:0.07, colorKey:'rooftop'},
      ],
      planType:'central-core',
    },
    {
      name:'Pixelated Taper',
      ref:'MVRDV / BIG approach — pixel tower',
      note:'Irregular steps create external terraces. Different programs visible as distinct volumes.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Retail',  floors:0.12, colorKey:'retail'},
        {xPct:0,    wPct:0.82, label:'Office',  floors:0.28, colorKey:'office'},
        {xPct:0.06, wPct:0.88, label:'Office',  floors:0.1,  colorKey:'office2'},
        {xPct:0.15, wPct:0.7,  label:'Amenity', floors:0.06, colorKey:'amenity'},
        {xPct:0.15, wPct:0.55, label:'Office',  floors:0.28, colorKey:'office'},
        {xPct:0.28, wPct:0.3,  label:'Rooftop', floors:0.1,  colorKey:'rooftop'},
        {xPct:0.35, wPct:0.18, label:'Spire',   floors:0.06, colorKey:'mech'},
      ],
      planType:'end-core',
    },
    {
      name:'Chamfered Tower',
      ref:'122 Leadenhall — Rogers Stirk Harbour',
      note:'Diagonal chamfer on one corner reduces bulk while maximising views at crown.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Lobby/Retail', floors:0.12, colorKey:'retail'},
        {xPct:0,    wPct:1.0,  label:'Office',        floors:0.45, colorKey:'office'},
        {xPct:0.08, wPct:0.92, label:'Office',        floors:0.2,  colorKey:'office2'},
        {xPct:0.18, wPct:0.82, label:'Office+Amen.',  floors:0.15, colorKey:'amenity'},
        {xPct:0.35, wPct:0.5,  label:'Crown',         floors:0.08, colorKey:'rooftop'},
      ],
      planType:'side-core',
    },
    {
      name:'Inverted Taper',
      ref:'CCTV Headquarters typology — OMA',
      note:'Wider at top than base — cantilevered upper floors. Structurally expressive.',
      sectionProfile:[
        {xPct:0.2,  wPct:0.6,  label:'Lobby/Mech', floors:0.12, colorKey:'mech'},
        {xPct:0.12, wPct:0.76, label:'Office',      floors:0.35, colorKey:'office'},
        {xPct:0.05, wPct:0.9,  label:'Office',      floors:0.3,  colorKey:'office2'},
        {xPct:0,    wPct:1.0,  label:'Amenity/Sky', floors:0.23, colorKey:'amenity'},
      ],
      planType:'central-core',
    },
  ],
  stepped: [
    {
      name:'Skyline Steps',
      ref:'Rockefeller Center tradition — Harrison & Abramovitz',
      note:'Three distinct setbacks create sky terraces at each level. Publicly accessible amenity.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Retail Podium',  floors:0.15, colorKey:'retail'},
        {xPct:0,    wPct:1.0,  label:'Lower Office',   floors:0.22, colorKey:'office'},
        {xPct:0.12, wPct:0.76, label:'Sky Terrace',    floors:0.06, colorKey:'amenity'},
        {xPct:0.12, wPct:0.76, label:'Mid Office',     floors:0.28, colorKey:'office2'},
        {xPct:0.25, wPct:0.5,  label:'Sky Terrace',    floors:0.05, colorKey:'amenity'},
        {xPct:0.25, wPct:0.5,  label:'Upper Office',   floors:0.18, colorKey:'office'},
        {xPct:0.35, wPct:0.3,  label:'Crown/Plant',    floors:0.06, colorKey:'rooftop'},
      ],
      planType:'central-core',
    },
    {
      name:'Cascading Terraces',
      ref:'One Angel Square — BDP / Heatherwick influence',
      note:'Steps cascade one direction (south-facing). Maximises solar access on terraces.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Ground Activation', floors:0.12, colorKey:'retail'},
        {xPct:0,    wPct:1.0,  label:'Office Band 1',     floors:0.2,  colorKey:'office'},
        {xPct:0.08, wPct:0.85, label:'Terrace + Office',  floors:0.18, colorKey:'office2'},
        {xPct:0.18, wPct:0.7,  label:'Office Band 3',     floors:0.25, colorKey:'office'},
        {xPct:0.3,  wPct:0.55, label:'Amenity Floor',     floors:0.08, colorKey:'amenity'},
        {xPct:0.3,  wPct:0.4,  label:'Upper Office',      floors:0.17, colorKey:'office2'},
      ],
      planType:'end-core',
    },
    {
      name:'Pixelated Stack',
      ref:'VIA 57 West / BIG — hybrid massing',
      note:'Irregular programme blocks create variety. Each step a different use with expressed facade.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Parking/Lobby',  floors:0.1,  colorKey:'mech'},
        {xPct:0,    wPct:0.9,  label:'Co-Working',     floors:0.12, colorKey:'highlight'},
        {xPct:0,    wPct:0.75, label:'Office',         floors:0.25, colorKey:'office'},
        {xPct:0.1,  wPct:0.65, label:'Amenity Sky',    floors:0.08, colorKey:'amenity'},
        {xPct:0.22, wPct:0.55, label:'Office Tower',   floors:0.3,  colorKey:'office2'},
        {xPct:0.32, wPct:0.35, label:'Rooftop Lounge', floors:0.15, colorKey:'rooftop'},
      ],
      planType:'side-core',
    },
  ],
  courtyard: [
    {
      name:'Central Atrium',
      ref:'Lloyd\'s of London / Richard Rogers — atrium as central spine',
      note:'Internal atrium floods all floors with daylight. Cores pushed to perimeter.',
      sectionProfile:[
        {xPct:0,    wPct:0.28, label:'Office Wing W', floors:1.0, colorKey:'office'},
        {xPct:0.35, wPct:0.3,  label:'Atrium Void',  floors:1.0, colorKey:'void'},
        {xPct:0.72, wPct:0.28, label:'Office Wing E', floors:1.0, colorKey:'office2'},
      ],
      planType:'perimeter-core',
    },
    {
      name:'Sky Garden Core',
      ref:'1 Undershaft — Eric Parry / The Gherkin — Foster',
      note:'Progressive sky gardens cut into the tower every 8–10 floors. Natural ventilation.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Podium',      floors:0.12, colorKey:'retail'},
        {xPct:0,    wPct:1.0,  label:'Office',      floors:0.2,  colorKey:'office'},
        {xPct:0.05, wPct:0.9,  label:'Sky Garden',  floors:0.06, colorKey:'amenity'},
        {xPct:0,    wPct:1.0,  label:'Office',      floors:0.2,  colorKey:'office2'},
        {xPct:0.05, wPct:0.9,  label:'Sky Garden',  floors:0.06, colorKey:'amenity'},
        {xPct:0.1,  wPct:0.8,  label:'Office',      floors:0.22, colorKey:'office'},
        {xPct:0.2,  wPct:0.6,  label:'Crown Terrace',floors:0.14, colorKey:'rooftop'},
      ],
      planType:'perimeter-core',
    },
    {
      name:'Split Courtyard',
      ref:'Tencent HQ / NBBJ — two towers sharing courtyard',
      note:'Building splits into two slabs framing a shared courtyard/garden.',
      sectionProfile:[
        {xPct:0,    wPct:0.4,  label:'Tower A',   floors:1.0, colorKey:'office'},
        {xPct:0.42, wPct:0.16, label:'Garden',    floors:0.3, colorKey:'void'},
        {xPct:0.6,  wPct:0.4,  label:'Tower B',   floors:0.85,colorKey:'office2'},
        {xPct:0.42, wPct:0.16, label:'Bridge',    floors:0.15,colorKey:'amenity'},
      ],
      planType:'dual-core',
    },
  ],
  cluster: [
    {
      name:'Podium + Twin Towers',
      ref:'Marina Bay Sands / One & Two World Trade — podium base',
      note:'Shared podium unites two towers of different heights. Creates address and public space.',
      sectionProfile:[
        {xPct:0,    wPct:1.0,  label:'Shared Podium',floors:0.15, colorKey:'retail'},
        {xPct:0,    wPct:0.42, label:'Tower A',      floors:0.85, colorKey:'office'},
        {xPct:0.58, wPct:0.42, label:'Tower B (tall)',floors:1.0, colorKey:'office2'},
        {xPct:0.15, wPct:0.7,  label:'Sky Bridge',   floors:0.05, colorKey:'amenity'},
      ],
      planType:'dual-core',
    },
    {
      name:'Asymmetric Cluster',
      ref:'Tour Carpe Diem / Morphosis asymmetric towers',
      note:'3 volumes of different heights — tallest at street corner, stepping down.',
      sectionProfile:[
        {xPct:0,    wPct:0.32, label:'Low-rise Vol.', floors:0.35, colorKey:'retail'},
        {xPct:0.34, wPct:0.3,  label:'Mid Tower',    floors:0.65, colorKey:'office2'},
        {xPct:0.66, wPct:0.34, label:'Main Tower',   floors:1.0,  colorKey:'office'},
        {xPct:0,    wPct:1.0,  label:'Ground Podium', floors:0.1,  colorKey:'amenity'},
      ],
      planType:'triple-core',
    },
    {
      name:'Linked Volumes',
      ref:'Bloomberg HQ London — Foster+Partners interconnected slabs',
      note:'Two or three offset slabs linked at mid-level by sky bridges.',
      sectionProfile:[
        {xPct:0,    wPct:0.44, label:'Slab A',      floors:0.9, colorKey:'office'},
        {xPct:0.44, wPct:0.12, label:'Bridge+Void', floors:0.3, colorKey:'void'},
        {xPct:0.56, wPct:0.44, label:'Slab B',      floors:1.0, colorKey:'office2'},
        {xPct:0.15, wPct:0.7,  label:'Connecting Bridge',floors:0.08, colorKey:'highlight'},
      ],
      planType:'dual-core',
    },
  ],
}

// ── COLOUR MAP ───────────────────────────────────────────────────────────────
const COLOR_MAP = {
  office:    { fill:'#b8d4e8', stroke:'#6fa3c8', text:'#1c3a52' },
  office2:   { fill:'#c8e0ee', stroke:'#7abed0', text:'#1a3048' },
  retail:    { fill:'#f9c784', stroke:'#d4a24e', text:'#3d2800' },
  amenity:   { fill:'#b8e0c8', stroke:'#5aaa80', text:'#0d3020' },
  mech:      { fill:'#d0ccc8', stroke:'#9a9690', text:'#2a2822' },
  rooftop:   { fill:'#f0c8b0', stroke:'#cc8860', text:'#3a1800' },
  highlight: { fill:'#ffd0a0', stroke:'#c89040', text:'#3a1a00' },
  void:      { fill:'rgba(200,218,232,0.25)', stroke:'#7a9aaa', text:'#4a6a7a', pattern:true },
  core:      { fill:'#e8ddd0', stroke:'#aa9880', text:'#3a2c1e' },
}

// ── DRAWING ENGINE ────────────────────────────────────────────────────────────
function drawSection(ctx, W, H, variant, selectedProgramColors) {
  if (!variant) return
  ctx.clearRect(0, 0, W, H)

  const PAD_L=60, PAD_R=20, PAD_T=30, PAD_B=55
  const drawW = W - PAD_L - PAD_R
  const drawH = H - PAD_T - PAD_B
  const profile = variant.sectionProfile
  const totalFloors = profile.reduce((s,b)=>s+b.floors,0)

  // Ground line
  ctx.fillStyle='#8aaa88'
  ctx.fillRect(PAD_L-10, PAD_T+drawH, drawW+20, 4)

  // Sky
  const skyGrad = ctx.createLinearGradient(0,PAD_T,0,PAD_T+drawH)
  skyGrad.addColorStop(0,'rgba(200,218,232,0.18)')
  skyGrad.addColorStop(1,'rgba(200,218,232,0)')
  ctx.fillStyle = skyGrad
  ctx.fillRect(PAD_L, PAD_T, drawW, drawH)

  let yAccum = 0
  profile.forEach((band, bi) => {
    const bandH = (band.floors / totalFloors) * drawH
    const bx = PAD_L + band.xPct * drawW
    const bw = band.wPct * drawW
    const by = PAD_T + yAccum
    const col = COLOR_MAP[band.colorKey] || COLOR_MAP.office

    // Fill
    if (band.colorKey === 'void') {
      // Hatched void
      ctx.save()
      ctx.beginPath(); ctx.rect(bx,by,bw,bandH); ctx.clip()
      ctx.fillStyle='rgba(200,218,232,0.2)'; ctx.fillRect(bx,by,bw,bandH)
      ctx.strokeStyle='rgba(100,140,160,0.2)'; ctx.lineWidth=0.8
      for(let d=-bandH; d<bw; d+=8){
        ctx.beginPath(); ctx.moveTo(bx+d,by); ctx.lineTo(bx+d+bandH,by+bandH); ctx.stroke()
      }
      ctx.restore()
    } else {
      ctx.fillStyle = col.fill
      ctx.fillRect(bx, by, bw, bandH)
    }

    // Stroke
    ctx.strokeStyle = col.stroke; ctx.lineWidth=1
    ctx.strokeRect(bx+0.5, by+0.5, bw-1, bandH-1)

    // Horizontal floor lines
    if (band.colorKey !== 'void' && band.colorKey !== 'mech') {
      const floorCount = Math.max(2, Math.round(band.floors * 3))
      const floorSpacing = bandH / floorCount
      ctx.strokeStyle = `${col.stroke}55`; ctx.lineWidth=0.5
      for(let f=1; f<floorCount; f++){
        ctx.beginPath()
        ctx.moveTo(bx+2, by+f*floorSpacing)
        ctx.lineTo(bx+bw-2, by+f*floorSpacing)
        ctx.stroke()
      }
    }

    // Label
    if (bandH > 16) {
      ctx.fillStyle = col.text
      ctx.font = `${Math.min(11, Math.max(8, bandH*0.22))}px 'DM Mono', monospace`
      ctx.textAlign = 'left'
      const maxChars = Math.floor(bw*0.14)
      const label = band.label.length > maxChars ? band.label.slice(0,maxChars-1)+'…' : band.label
      ctx.fillText(label, bx+5, by+Math.min(14,bandH*0.55))
    }

    yAccum += bandH
  })

  // Height dimension on left
  ctx.strokeStyle = '#7a9e85'; ctx.lineWidth=0.8; ctx.setLineDash([4,3])
  ctx.beginPath(); ctx.moveTo(PAD_L-14,PAD_T); ctx.lineTo(PAD_L-14,PAD_T+drawH); ctx.stroke()
  ctx.setLineDash([])
  // arrow tips
  ctx.fillStyle='#7a9e85'
  const arrY1=PAD_T, arrY2=PAD_T+drawH
  ;[[arrY1,1],[arrY2,-1]].forEach(([y,dir])=>{
    ctx.beginPath(); ctx.moveTo(PAD_L-14,y); ctx.lineTo(PAD_L-18,y+dir*6); ctx.lineTo(PAD_L-10,y+dir*6); ctx.closePath(); ctx.fill()
  })
  ctx.fillStyle='#4a7055'; ctx.font='10px DM Mono, monospace'; ctx.textAlign='center'
  ctx.save(); ctx.translate(PAD_L-28,PAD_T+drawH/2); ctx.rotate(-Math.PI/2)
  ctx.fillText(`${variant.maxFloors||20}F / ${(variant.maxFloors||20)*14}ft`,0,0)
  ctx.restore()

  // Width dimension on bottom
  ctx.strokeStyle='#7a9e85'; ctx.lineWidth=0.8; ctx.setLineDash([4,3])
  ctx.beginPath(); ctx.moveTo(PAD_L,PAD_T+drawH+18); ctx.lineTo(PAD_L+drawW,PAD_T+drawH+18); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle='#4a7055'; ctx.font='10px DM Mono, monospace'; ctx.textAlign='center'
  ctx.fillText(`${variant.envW||100} ft`, PAD_L+drawW/2, PAD_T+drawH+32)

  // Label top
  ctx.fillStyle='#1c2e20'; ctx.font="bold 11px 'DM Mono', monospace"; ctx.textAlign='left'
  ctx.fillText(variant.name||'', PAD_L, PAD_T-10)
}

function drawPlan(ctx, W, H, variant) {
  if (!variant) return
  ctx.clearRect(0, 0, W, H)
  const PAD=20, dW=W-PAD*2, dH=H-PAD*2
  const pt = variant.planType || 'central-core'

  // Building outline
  ctx.fillStyle='#dce8f2'; ctx.fillRect(PAD,PAD,dW,dH)
  ctx.strokeStyle='#4a7055'; ctx.lineWidth=1.5; ctx.strokeRect(PAD,PAD,dW,dH)

  // Setback lines (dashed)
  ctx.strokeStyle='rgba(74,112,85,0.3)'; ctx.lineWidth=0.7; ctx.setLineDash([4,4])
  const sb=14
  ctx.strokeRect(PAD+sb,PAD+sb,dW-sb*2,dH-sb*2)
  ctx.setLineDash([])

  // Plan layout by type
  const plans = {
    'central-core': () => {
      // Central core
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'
      const cx=PAD+dW/2-dW*0.12, cy=PAD+dH/2-dH*0.15
      ctx.fillRect(cx,cy,dW*0.24,dH*0.30)
      ctx.lineWidth=1; ctx.strokeRect(cx,cy,dW*0.24,dH*0.30)
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
      ctx.fillText('CORE',cx+dW*0.12,cy+dH*0.17)
      // Office zone text
      ctx.fillStyle='#1c3a52'; ctx.font='9px DM Mono, monospace'; ctx.textAlign='center'
      ctx.fillText('OFFICE',PAD+dW/2,PAD+18)
      ctx.fillText('OFFICE',PAD+dW/2,PAD+dH-10)
    },
    'end-core': () => {
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,dW*0.2,dH)
      ctx.strokeRect(PAD,PAD,dW*0.2,dH)
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
      ctx.save(); ctx.translate(PAD+dW*0.1,PAD+dH/2); ctx.rotate(-Math.PI/2)
      ctx.fillText('CORE',0,0); ctx.restore()
      ctx.fillStyle='#1c3a52'; ctx.textAlign='center'
      ctx.fillText('OPEN OFFICE FLOOR PLATE',PAD+dW*0.6,PAD+dH/2)
    },
    'side-core': () => {
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,dW,dH*0.22)
      ctx.strokeRect(PAD,PAD,dW,dH*0.22)
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
      ctx.fillText('CORE',PAD+dW/2,PAD+dH*0.14)
      ctx.fillStyle='#1c3a52'; ctx.fillText('OFFICE FLOOR PLATE',PAD+dW/2,PAD+dH*0.6)
    },
    'perimeter-core': () => {
      // Four corner cores
      const cSz=dW*0.14
      ;[[PAD,PAD],[PAD+dW-cSz,PAD],[PAD,PAD+dH-cSz],[PAD+dW-cSz,PAD+dH-cSz]].forEach(([x,y])=>{
        ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
        ctx.fillRect(x,y,cSz,cSz); ctx.strokeRect(x,y,cSz,cSz)
        ctx.fillStyle='#4a7055'; ctx.font='7px DM Mono, monospace'; ctx.textAlign='center'
        ctx.fillText('C',x+cSz/2,y+cSz/2+2)
      })
      // Atrium
      const aw=dW*0.36,ah=dH*0.36
      ctx.fillStyle='rgba(180,220,240,0.3)'; ctx.strokeStyle='#7abed0'; ctx.lineWidth=1.5; ctx.setLineDash([3,3])
      ctx.fillRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah)
      ctx.strokeRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah); ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a'; ctx.font='9px DM Mono, monospace'; ctx.textAlign='center'
      ctx.fillText('ATRIUM',PAD+dW/2,PAD+dH/2+3)
      ctx.fillStyle='#1c3a52'; ctx.fillText('OFFICE RING',PAD+dW/2,PAD+20)
    },
    'dual-core': () => {
      const cW=dW*0.16, cH=dH*0.4
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ;[[PAD+dW*0.2-cW/2,PAD+dH/2-cH/2],[PAD+dW*0.8-cW/2,PAD+dH/2-cH/2]].forEach(([x,y])=>{
        ctx.fillRect(x,y,cW,cH); ctx.strokeRect(x,y,cW,cH)
        ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
        ctx.fillText('CORE',x+cW/2,y+cH/2+3); ctx.fillStyle='#d0ccc8'
      })
      // Gap
      ctx.fillStyle='rgba(200,218,232,0.4)'; ctx.strokeStyle='#7a9aaa'; ctx.setLineDash([3,3]); ctx.lineWidth=0.8
      ctx.fillRect(PAD+dW*0.4,PAD,dW*0.2,dH); ctx.strokeRect(PAD+dW*0.4,PAD,dW*0.2,dH)
      ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
      ctx.fillText('VOID/GARDEN',PAD+dW/2,PAD+dH/2+3)
      ctx.fillStyle='#1c3a52'; ctx.fillText('SLAB A',PAD+dW*0.2,PAD+20); ctx.fillText('SLAB B',PAD+dW*0.8,PAD+20)
    },
    'triple-core': () => {
      const w1=dW*0.28, w2=dW*0.33, w3=dW*0.34
      const cores=[[PAD,PAD,w1,dH,0.35],[PAD+w1+4,PAD,w2,dH,0.65],[PAD+w1+w2+8,PAD,w3,dH,1.0]]
      const bgs=['#c8dce8','#b8d4e4','#a8cce0']
      cores.forEach(([x,y,w,h,hi],i)=>{
        ctx.fillStyle=bgs[i]; ctx.strokeStyle='#5a8aaa'; ctx.lineWidth=1
        ctx.fillRect(x,y,w,h*hi); ctx.strokeRect(x,y,w,h*hi)
        ctx.fillStyle='#1c3a52'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
        ctx.fillText(['LOW','MID','MAIN'][i],x+w/2,y+h*hi-8)
      })
    },
  }
  ;(plans[pt]||plans['central-core'])()

  // North arrow
  ctx.save(); ctx.translate(W-PAD-16,PAD+16)
  ctx.fillStyle='#2d6a4f'
  ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(4,0); ctx.lineTo(0,-4); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#adc5b5'
  ctx.beginPath(); ctx.moveTo(0,12); ctx.lineTo(4,0); ctx.lineTo(0,4); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#2d6a4f'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='center'
  ctx.fillText('N',0,-16)
  ctx.restore()

  // Scale bar
  ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono, monospace'; ctx.textAlign='left'
  ctx.fillText('0      50ft',PAD,H-6)
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Step3Massing({ state, update, onNext, onBack }) {
  const sectionRef = useRef(null)
  const planRef    = useRef(null)

  const [activeTypology, setActiveTypology] = useState('box')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [variants, setVariants] = useState([])
  const [view, setView] = useState('section') // section | plan | both

  const programs = state.selectedPrograms || []
  const totalSF  = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA   = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW     = (state.lotW||120)-(state.sideSB||10)*2
  const envD     = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const maxFloors= Math.max(4,Math.round((state.heightMax||180)/14))
  const farUsed  = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)

  // Generate variants for selected typology
  const computeVariants = useCallback((typoId) => {
    const lib = VARIANT_LIBRARY[typoId] || []
    const enriched = lib.map(v=>({...v,envW,envD,maxFloors,totalSF,programs,lotW:state.lotW,lotD:state.lotD}))
    setVariants(enriched)
    setSelectedVariant(enriched[0]||null)
    update({ massingType:typoId, selectedMassingVariant: enriched[0]?.name })
  },[envW,envD,maxFloors,totalSF,state])

  useEffect(()=>{ computeVariants(activeTypology) },[activeTypology])

  // Draw when variant or view changes
  useEffect(()=>{
    if (!selectedVariant) return
    if (sectionRef.current && (view==='section'||view==='both')) {
      const c=sectionRef.current, ctx=c.getContext('2d')
      drawSection(ctx,c.width,c.height,selectedVariant,programs)
    }
    if (planRef.current && (view==='plan'||view==='both')) {
      const c=planRef.current, ctx=c.getContext('2d')
      drawPlan(ctx,c.width,c.height,selectedVariant)
    }
  },[selectedVariant,view,programs])

  // Handle canvas resize
  useEffect(()=>{
    const obs = new ResizeObserver(()=>{ if(selectedVariant){
      if(sectionRef.current){const c=sectionRef.current;drawSection(c.getContext('2d'),c.width,c.height,selectedVariant,programs)}
      if(planRef.current){const c=planRef.current;drawPlan(c.getContext('2d'),c.width,c.height,selectedVariant)}
    }})
    if(sectionRef.current) obs.observe(sectionRef.current)
    return ()=>obs.disconnect()
  },[selectedVariant])

  const selectVariant = (v) => {
    setSelectedVariant(v)
    update({ selectedMassingVariant: v.name, massingType:activeTypology })
  }

  // Legend from current variant
  const legendItems = selectedVariant
    ? [...new Map(selectedVariant.sectionProfile.map(b=>[b.colorKey, b])).values()]
    : []

  return (
    <div className="step-full" style={{flexDirection:'column'}}>
      {/* Top bar */}
      <div className="massing-topbar">
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span className="step-title" style={{fontSize:22}}>Massing <em>proposal.</em></span>
          <span className="tag">Step 03</span>
        </div>
        <div className="typo-tabs">
          {TYPOLOGIES.map(t=>(
            <button key={t.id} className={`typo-tab ${activeTypology===t.id?'active':''}`}
              onClick={()=>setActiveTypology(t.id)}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:6}}>
          {['section','plan','both'].map(v=>(
            <button key={v} className={`view-tab ${view===v?'active':''}`} onClick={()=>setView(v)}>
              {v==='both'?'Section + Plan':v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="massing-body">
        {/* Left: variant cards */}
        <div className="variant-list">
          <div className="section-head" style={{marginBottom:8}}>
            <span className="section-label">{TYPOLOGIES.find(t=>t.id===activeTypology)?.label} variants</span>
            <div className="section-line"/>
          </div>
          <p style={{fontSize:11,color:'var(--ink-dim)',lineHeight:1.5,marginBottom:12}}>
            {TYPOLOGIES.find(t=>t.id===activeTypology)?.desc}
          </p>
          {variants.map((v,i)=>(
            <div key={v.name} className={`variant-card ${selectedVariant?.name===v.name?'active':''}`}
              onClick={()=>selectVariant(v)}>
              <div className="variant-card-top">
                <span className="variant-name">{v.name}</span>
                {selectedVariant?.name===v.name && <span style={{fontSize:9,color:'var(--accent)',fontFamily:'var(--font-mono)'}}>SELECTED</span>}
              </div>
              <div className="variant-ref">{v.ref}</div>
              <p className="variant-note">{v.note}</p>
              {/* Mini section preview */}
              <div className="variant-mini">
                {v.sectionProfile.map((b,bi)=>{
                  const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
                  return (
                    <div key={bi} style={{
                      flex: b.floors, width: `${b.wPct*100}%`,
                      background:col.fill, borderTop:`1.5px solid ${col.stroke}`,
                      marginLeft:`${b.xPct*100}%`, marginRight:`${(1-b.xPct-b.wPct)*100}%`,
                      minHeight:4,
                    }}/>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Centre: diagrams */}
        <div className="diagram-area">
          {(view==='section'||view==='both') && (
            <div className={`canvas-wrap ${view==='both'?'half':''}`}>
              <div className="canvas-label">SECTION</div>
              <canvas ref={sectionRef} width={520} height={420} className="diagram-canvas" />
            </div>
          )}
          {(view==='plan'||view==='both') && (
            <div className={`canvas-wrap ${view==='both'?'half':''}`}>
              <div className="canvas-label">FLOOR PLAN (TYPICAL)</div>
              <canvas ref={planRef} width={320} height={320} className="diagram-canvas" />
            </div>
          )}
        </div>

        {/* Right: programme data */}
        <div className="massing-sidebar">
          <div className="card-white" style={{marginBottom:12}}>
            <div className="section-label" style={{marginBottom:8}}>Constraints check</div>
            {[
              {l:'Total GFA',v:`${totalSF.toLocaleString()} sf`,sub:`max ${Math.round(maxGFA).toLocaleString()}`,ok:totalSF<=maxGFA},
              {l:'FAR',v:`${farUsed} / ${state.farMax}`,ok:+farUsed<=state.farMax},
              {l:'Max floors',v:`${maxFloors}F / ${maxFloors*14}ft`,sub:`limit ${state.heightMax}ft`,ok:maxFloors*14<=state.heightMax},
              {l:'Envelope',v:`${envW}×${envD} ft`,ok:true},
            ].map(m=>(
              <div key={m.l} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:5}}>
                <div>
                  <span style={{fontSize:11,color:'var(--ink-mid)'}}>{m.l}</span>
                  {m.sub && <span style={{fontSize:9,color:'var(--ink-ghost)',marginLeft:4}}>{m.sub}</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:m.ok?'var(--accent)':'var(--red)'}}>{m.v}</span>
                  <span>{m.ok?'✓':'⚠'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Programme legend */}
          <div className="card-white" style={{marginBottom:12}}>
            <div className="section-label" style={{marginBottom:8}}>Programme legend</div>
            {legendItems.map(b=>{
              const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
              return (
                <div key={b.colorKey} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <div style={{width:14,height:10,background:col.fill,border:`1px solid ${col.stroke}`,borderRadius:2,flexShrink:0}}/>
                  <span style={{fontSize:11,color:'var(--ink-mid)',flex:1}}>{b.label}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>
                    {Math.round(b.floors*100)}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Your programmes */}
          {programs.length>0 && (
            <div className="card-white" style={{marginBottom:12}}>
              <div className="section-label" style={{marginBottom:8}}>Your programmes</div>
              {programs.slice(0,8).map(p=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                  <span style={{fontSize:10,color:'var(--ink-mid)',flex:1}}>{p.label}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>{(p.sf||p.defaultSF||0).toLocaleString()}</span>
                </div>
              ))}
              {programs.length>8 && <div style={{fontSize:10,color:'var(--ink-ghost)',marginTop:2}}>+{programs.length-8} more</div>}
            </div>
          )}

          {/* Selected variant info */}
          {selectedVariant && (
            <div className="card-white">
              <div className="section-label" style={{marginBottom:6}}>Selected option</div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:3}}>{selectedVariant.name}</div>
              <div style={{fontSize:10,color:'var(--gold)',fontFamily:'var(--font-mono)',marginBottom:6}}>{selectedVariant.ref}</div>
              <p style={{fontSize:11,color:'var(--ink-mid)',lineHeight:1.5}}>{selectedVariant.note}</p>
            </div>
          )}

          <div style={{display:'flex',gap:8,marginTop:'auto'}}>
            <button className="btn-ghost" onClick={onBack} style={{flex:1}}>← Back</button>
            <button className="btn-primary" onClick={onNext} style={{flex:2}}>Solar Analysis →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
