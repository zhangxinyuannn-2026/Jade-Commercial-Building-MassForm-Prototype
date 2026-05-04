import React, { useRef, useEffect, useState, useCallback } from 'react'
import './Step3Massing.css'

const TYPOLOGIES = [
  { id:'box',       label:'Box / Slab',      icon:'▬', desc:'Regular extruded volume — core placement variations' },
  { id:'taper',     label:'Taper / Spire',   icon:'▲', desc:'Upper floors reduce — light access, sky exposure' },
  { id:'stepped',   label:'Stepped',         icon:'⊏', desc:'Setback tiers with sky terraces at each step' },
  { id:'courtyard', label:'Courtyard',       icon:'◻', desc:'Central void — atrium, light wells, garden court' },
  { id:'cluster',   label:'Cluster / Split', icon:'◈', desc:'Multiple volumes linked by bridges or podium' },
]

const COLOR_MAP = {
  office:    { fill:'#b8d4e8', stroke:'#5a92b8', text:'#1c3a52' },
  office2:   { fill:'#c4dff0', stroke:'#6ab0d0', text:'#1a3048' },
  retail:    { fill:'#f7c97a', stroke:'#c8962e', text:'#3d2800' },
  amenity:   { fill:'#b4dfc4', stroke:'#4aaa74', text:'#0d3020' },
  mech:      { fill:'#d4d0cc', stroke:'#9a9690', text:'#2a2822' },
  rooftop:   { fill:'#e8c4a8', stroke:'#c07850', text:'#3a1800' },
  highlight: { fill:'#ffc890', stroke:'#c08030', text:'#3a1a00' },
  void:      { fill:'rgba(200,220,235,0.3)', stroke:'#7a9aaa', text:'#4a6a7a' },
  core:      { fill:'#e4ddd5', stroke:'#aa9880', text:'#3a2c1e' },
}

// sectionProfile: GROUND→ROOF order. Index 0 = ground floor, last = roof.
const VARIANT_LIBRARY = {
  box: [
    { name:'Central Core', ref:'Seagram Building — Mies van der Rohe',
      note:'Core centred, equal perimeter offices on all sides. Maximum floor-plate efficiency.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail',  floors:0.10, colorKey:'retail'  },
        { xPct:0,   wPct:1.0, label:'Office',           floors:0.82, colorKey:'office'  },
        { xPct:0.1, wPct:0.8, label:'Mechanical / MEP',floors:0.08, colorKey:'mech'    },
      ], planType:'central-core' },
    { name:'Podium + Shaft', ref:'30 Hudson Yards — KPF',
      note:'Wide podium base (retail/amenity) + slender tower shaft. Strong urban street presence.',
      sectionProfile:[
        { xPct:0,    wPct:1.0, label:'Lobby / Retail', floors:0.08, colorKey:'retail'  },
        { xPct:0,    wPct:1.0, label:'Amenity Podium', floors:0.14, colorKey:'amenity' },
        { xPct:0.15, wPct:0.7, label:'Office Shaft',   floors:0.70, colorKey:'office'  },
        { xPct:0.25, wPct:0.5, label:'Crown / Plant',  floors:0.08, colorKey:'rooftop' },
      ], planType:'central-core' },
    { name:'Dual-Band', ref:'The Shard — Renzo Piano',
      note:'Horizontal programme bands clearly expressed in section. Trading / office / mechanical each legible.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail',  floors:0.10, colorKey:'retail'    },
        { xPct:0,   wPct:1.0, label:'Trading/Finance',  floors:0.20, colorKey:'highlight' },
        { xPct:0,   wPct:1.0, label:'Office',           floors:0.50, colorKey:'office'    },
        { xPct:0.1, wPct:0.8, label:'Mechanical',       floors:0.08, colorKey:'mech'      },
        { xPct:0.3, wPct:0.4, label:'Crown / Plant',    floors:0.12, colorKey:'rooftop'   },
      ], planType:'central-core' },
    { name:'End Core', ref:'Lever House — SOM',
      note:'Core at north end frees the south facade for maximum daylight and glazing performance.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail', floors:0.10, colorKey:'retail' },
        { xPct:0,   wPct:1.0, label:'Office',          floors:0.82, colorKey:'office' },
        { xPct:0.1, wPct:0.8, label:'Plant / MEP',     floors:0.08, colorKey:'mech'  },
      ], planType:'end-core' },
  ],
  taper: [
    { name:'Classic Taper', ref:'Empire State / Chrysler — Art Deco tradition',
      note:'Gradual reduction from base to crown. Maximum FAR at lower floors; slender spire at top.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail', floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:0.95, label:'Office',          floors:0.30, colorKey:'office'  },
        { xPct:0.06, wPct:0.88, label:'Office',          floors:0.24, colorKey:'office2' },
        { xPct:0.14, wPct:0.72, label:'Office',          floors:0.20, colorKey:'office'  },
        { xPct:0.28, wPct:0.44, label:'Amenity / Sky',  floors:0.09, colorKey:'amenity' },
        { xPct:0.38, wPct:0.24, label:'Crown',           floors:0.05, colorKey:'rooftop' },
      ], planType:'central-core' },
    { name:'Pixelated Taper', ref:'MVRDV / BIG — pixel tower',
      note:'Irregular steps create external terraces at different levels. Each step a distinct programme.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Retail / Lobby', floors:0.10, colorKey:'retail'   },
        { xPct:0,    wPct:0.90, label:'Office',          floors:0.22, colorKey:'office'   },
        { xPct:0.05, wPct:0.80, label:'Office',          floors:0.18, colorKey:'office2'  },
        { xPct:0.12, wPct:0.65, label:'Amenity Terrace',floors:0.08, colorKey:'amenity'  },
        { xPct:0.12, wPct:0.52, label:'Office',          floors:0.24, colorKey:'office'   },
        { xPct:0.24, wPct:0.30, label:'Sky Lounge',      floors:0.10, colorKey:'rooftop'  },
        { xPct:0.32, wPct:0.16, label:'Crown / Spire',  floors:0.08, colorKey:'mech'     },
      ], planType:'end-core' },
    { name:'Chamfered Tower', ref:'122 Leadenhall — Rogers Stirk Harbour',
      note:'Diagonal chamfer reduces bulk at street level while maximising crown views and light.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail', floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office',          floors:0.42, colorKey:'office'  },
        { xPct:0.06, wPct:0.94, label:'Office',          floors:0.22, colorKey:'office2' },
        { xPct:0.16, wPct:0.78, label:'Office + Amen.',  floors:0.18, colorKey:'amenity' },
        { xPct:0.36, wPct:0.50, label:'Crown',           floors:0.08, colorKey:'rooftop' },
      ], planType:'side-core' },
    { name:'Inverted Taper', ref:'CCTV HQ — OMA',
      note:'Wider at top than base — cantilevered upper floors. Structurally expressive and visually dramatic.',
      sectionProfile:[
        { xPct:0.22, wPct:0.56, label:'Lobby / Entry',  floors:0.10, colorKey:'retail'  },
        { xPct:0.14, wPct:0.72, label:'Office',          floors:0.28, colorKey:'office'  },
        { xPct:0.06, wPct:0.88, label:'Office',          floors:0.30, colorKey:'office2' },
        { xPct:0,    wPct:1.0,  label:'Amenity / Sky',  floors:0.20, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Crown Garden',   floors:0.12, colorKey:'rooftop' },
      ], planType:'central-core' },
  ],
  stepped: [
    { name:'Skyline Steps', ref:'Rockefeller Center — Harrison & Abramovitz',
      note:'Three setbacks create sky terraces. Each step an accessible public amenity.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Retail / Lobby',  floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Lower Office',     floors:0.20, colorKey:'office'  },
        { xPct:0,    wPct:1.0,  label:'Sky Terrace 1',   floors:0.05, colorKey:'amenity' },
        { xPct:0.12, wPct:0.76, label:'Mid Office',       floors:0.26, colorKey:'office2' },
        { xPct:0.12, wPct:0.76, label:'Sky Terrace 2',   floors:0.05, colorKey:'amenity' },
        { xPct:0.26, wPct:0.48, label:'Upper Office',     floors:0.20, colorKey:'office'  },
        { xPct:0.36, wPct:0.28, label:'Crown / Plant',   floors:0.12, colorKey:'rooftop' },
      ], planType:'central-core' },
    { name:'Cascading Terraces', ref:'One Angel Square — BDP',
      note:'Steps cascade towards south for solar access. Planted outdoor terraces at each level.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Ground Activation',floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office Band 1',    floors:0.18, colorKey:'office'  },
        { xPct:0.08, wPct:0.84, label:'Office Band 2',    floors:0.18, colorKey:'office2' },
        { xPct:0.18, wPct:0.68, label:'Terrace + Office', floors:0.22, colorKey:'office'  },
        { xPct:0.30, wPct:0.52, label:'Amenity Floor',    floors:0.10, colorKey:'amenity' },
        { xPct:0.30, wPct:0.40, label:'Upper Office',     floors:0.22, colorKey:'office2' },
      ], planType:'end-core' },
    { name:'Pixelated Stack', ref:'VIA 57 West — BIG',
      note:'Irregular programme blocks at each level. Each step a different use with distinct facade expression.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Parking / Lobby', floors:0.10, colorKey:'mech'     },
        { xPct:0,    wPct:0.90, label:'Co-Working',       floors:0.12, colorKey:'highlight'},
        { xPct:0,    wPct:0.76, label:'Office',           floors:0.22, colorKey:'office'   },
        { xPct:0.10, wPct:0.64, label:'Amenity Sky',      floors:0.08, colorKey:'amenity'  },
        { xPct:0.22, wPct:0.54, label:'Office Tower',     floors:0.28, colorKey:'office2'  },
        { xPct:0.32, wPct:0.34, label:'Rooftop Lounge',  floors:0.20, colorKey:'rooftop'  },
      ], planType:'side-core' },
  ],
  courtyard: [
    { name:'Central Atrium', ref:"Lloyd's of London — Richard Rogers",
      note:'Internal atrium floods all floors with daylight. Cores pushed to perimeter.',
      sectionProfile:[
        { xPct:0,    wPct:0.30, label:'Office Wing W',   floors:1.0, colorKey:'office'  },
        { xPct:0.35, wPct:0.30, label:'Atrium Void',     floors:1.0, colorKey:'void'    },
        { xPct:0.70, wPct:0.30, label:'Office Wing E',   floors:1.0, colorKey:'office2' },
      ], planType:'perimeter-core' },
    { name:'Sky Garden Core', ref:'The Gherkin — Foster + Partners',
      note:'Sky gardens inserted every 8–10 floors for natural ventilation and occupant wellbeing.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail',  floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.18, colorKey:'office'  },
        { xPct:0.05, wPct:0.90, label:'Sky Garden 1',    floors:0.06, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.20, colorKey:'office2' },
        { xPct:0.05, wPct:0.90, label:'Sky Garden 2',    floors:0.06, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.24, colorKey:'office'  },
        { xPct:0.20, wPct:0.60, label:'Crown Terrace',   floors:0.16, colorKey:'rooftop' },
      ], planType:'perimeter-core' },
    { name:'Split Courtyard', ref:'Tencent HQ — NBBJ',
      note:'Building splits into two slabs framing a shared courtyard garden open to the public.',
      sectionProfile:[
        { xPct:0,    wPct:0.42, label:'Tower A',          floors:1.0,  colorKey:'office'  },
        { xPct:0.44, wPct:0.14, label:'Courtyard',        floors:0.30, colorKey:'void'    },
        { xPct:0.44, wPct:0.14, label:'Sky Bridge',       floors:0.15, colorKey:'amenity' },
        { xPct:0.60, wPct:0.40, label:'Tower B',          floors:0.88, colorKey:'office2' },
      ], planType:'dual-core' },
  ],
  cluster: [
    { name:'Podium + Twin Towers', ref:'One & Two WTC — podium base',
      note:'Shared podium unites two towers of different heights. Creates strong public address.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Shared Podium',   floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:0.42, label:'Tower A',          floors:0.78, colorKey:'office'  },
        { xPct:0.58, wPct:0.42, label:'Tower B (tall)',  floors:0.98, colorKey:'office2' },
        { xPct:0.16, wPct:0.66, label:'Sky Bridge',       floors:0.05, colorKey:'amenity' },
      ], planType:'dual-core' },
    { name:'Asymmetric Cluster', ref:'Tour Carpe Diem — Morphosis',
      note:'Three volumes of different heights — tallest at corner, stepping down to street.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Ground Podium',   floors:0.10, colorKey:'amenity' },
        { xPct:0,    wPct:0.32, label:'Low-rise Vol.',    floors:0.28, colorKey:'retail'  },
        { xPct:0.34, wPct:0.30, label:'Mid Tower',        floors:0.58, colorKey:'office2' },
        { xPct:0.66, wPct:0.34, label:'Main Tower',       floors:0.92, colorKey:'office'  },
      ], planType:'triple-core' },
    { name:'Linked Volumes', ref:'Bloomberg HQ London — Foster + Partners',
      note:'Two offset slabs linked at mid-level by connecting sky bridge and shared void.',
      sectionProfile:[
        { xPct:0,    wPct:0.44, label:'Slab A',           floors:0.92, colorKey:'office'    },
        { xPct:0.44, wPct:0.12, label:'Void / Bridge',    floors:0.35, colorKey:'void'      },
        { xPct:0.56, wPct:0.44, label:'Slab B',           floors:1.0,  colorKey:'office2'   },
        { xPct:0.16, wPct:0.68, label:'Connecting Bridge',floors:0.08, colorKey:'highlight' },
      ], planType:'dual-core' },
  ],
}

// ── HI-RES CANVAS + Y-FLIP ───────────────────────────────────────────────────
// Ground = bottom. Uses ctx.scale(1,-1) so drawing y=0 is ground level.
function drawSection(canvas, variant) {
  if (!canvas || !variant) return
  const dpr = window.devicePixelRatio || 2
  const W = canvas.offsetWidth || 600
  const H = canvas.offsetHeight || 480
  canvas.width  = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const PL=62, PR=18, PT=44, PB=52
  const dW = W-PL-PR, dH = H-PT-PB

  // Flip: origin at bottom-left of drawing area, Y increases upward
  ctx.save()
  ctx.translate(PL, PT + dH)
  ctx.scale(1, -1)

  // Sky
  const skyG = ctx.createLinearGradient(0, 0, 0, dH)
  skyG.addColorStop(0,'rgba(185,210,232,0)')
  skyG.addColorStop(1,'rgba(185,210,232,0.18)')
  ctx.fillStyle = skyG; ctx.fillRect(0, 0, dW, dH)

  const profile  = variant.sectionProfile  // GROUND→ROOF, drawn bottom→top
  const totalPct = profile.reduce((s,b) => s + b.floors, 0)
  const isParallel = ['dual-core','perimeter-core','triple-core'].includes(variant.planType)

  if (isParallel) {
    profile.forEach(band => {
      const colH = (band.floors / 1.0) * dH
      drawBand(ctx, band.xPct * dW, 0, band.wPct * dW, colH, band)
    })
  } else {
    let y = 0
    profile.forEach(band => {
      const bH = (band.floors / totalPct) * dH
      drawBand(ctx, band.xPct * dW, y, band.wPct * dW, bH, band)
      y += bH
    })
  }

  ctx.restore() // un-flip

  // Ground line + hatching
  ctx.fillStyle = '#7aaa82'; ctx.fillRect(PL-14, PT+dH, dW+28, 3)
  ctx.strokeStyle = 'rgba(80,120,80,0.16)'; ctx.lineWidth = 0.8
  for (let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(PL-14,PT+dH+3+i*4);ctx.lineTo(PL+dW+14,PT+dH+3+i*4);ctx.stroke()}

  // Height dimension
  const dimX = PL-28
  ctx.strokeStyle='#4a7055';ctx.lineWidth=0.9;ctx.setLineDash([3,3])
  ctx.beginPath();ctx.moveTo(dimX,PT);ctx.lineTo(dimX,PT+dH);ctx.stroke();ctx.setLineDash([])
  ;[[PT,-1],[PT+dH,1]].forEach(([y,d])=>{ctx.fillStyle='#4a7055';ctx.beginPath();ctx.moveTo(dimX,y);ctx.lineTo(dimX-4,y+d*7);ctx.lineTo(dimX+4,y+d*7);ctx.closePath();ctx.fill()})
  ctx.save();ctx.fillStyle='#2d6a4f';ctx.font='500 11px DM Mono,monospace';ctx.textAlign='center'
  ctx.translate(dimX-14,PT+dH/2);ctx.rotate(-Math.PI/2)
  ctx.fillText(`${variant.maxFloors||20}F  /  ${(variant.maxFloors||20)*14}ft`,0,0);ctx.restore()

  // Width dimension
  const dimY = PT+dH+20
  ctx.strokeStyle='#4a7055';ctx.lineWidth=0.9;ctx.setLineDash([3,3])
  ctx.beginPath();ctx.moveTo(PL,dimY);ctx.lineTo(PL+dW,dimY);ctx.stroke();ctx.setLineDash([])
  ;[[PL,-1],[PL+dW,1]].forEach(([x,d])=>{ctx.fillStyle='#4a7055';ctx.beginPath();ctx.moveTo(x,dimY);ctx.lineTo(x+d*7,dimY-4);ctx.lineTo(x+d*7,dimY+4);ctx.closePath();ctx.fill()})
  ctx.fillStyle='#2d6a4f';ctx.font='11px DM Mono,monospace';ctx.textAlign='center'
  ctx.fillText(`${variant.envW||100} ft`,PL+dW/2,dimY+16)

  // Title
  ctx.fillStyle='#1c2e20';ctx.font='bold 12px DM Mono,monospace';ctx.textAlign='left'
  ctx.fillText(variant.name||'',PL,PT-22)
  ctx.fillStyle='#7a9e85';ctx.font='10px DM Mono,monospace'
  ctx.fillText(variant.ref||'',PL,PT-10)
}

function drawBand(ctx, bx, by, bw, bH, band) {
  if (bH < 1 || bw < 1) return
  const col = COLOR_MAP[band.colorKey] || COLOR_MAP.office
  if (band.colorKey === 'void') {
    ctx.save();ctx.beginPath();ctx.rect(bx,by,bw,bH);ctx.clip()
    ctx.fillStyle='rgba(200,218,232,0.22)';ctx.fillRect(bx,by,bw,bH)
    ctx.strokeStyle='rgba(90,130,155,0.22)';ctx.lineWidth=0.9;ctx.setLineDash([5,4])
    for(let d=-bH;d<bw+bH;d+=10){ctx.beginPath();ctx.moveTo(bx+d,by);ctx.lineTo(bx+d+bH,by+bH);ctx.stroke()}
    ctx.setLineDash([]);ctx.restore()
  } else {
    ctx.fillStyle=col.fill;ctx.fillRect(bx,by,bw,bH)
  }
  ctx.strokeStyle=col.stroke;ctx.lineWidth=1.2;ctx.strokeRect(bx+0.6,by+0.6,bw-1.2,bH-1.2)
  if (!['void','mech','core'].includes(band.colorKey) && bH>20){
    const fCount=Math.max(2,Math.round(band.floors*4))
    ctx.strokeStyle=col.stroke+'44';ctx.lineWidth=0.5
    for(let f=1;f<fCount;f++){ctx.beginPath();ctx.moveTo(bx+2,by+(f/fCount)*bH);ctx.lineTo(bx+bw-2,by+(f/fCount)*bH);ctx.stroke()}
  }
  if (bH>16){
    ctx.save()
    ctx.translate(bx+bw/2, by+bH/2);ctx.scale(1,-1) // un-flip text
    ctx.fillStyle=col.text
    const fs=Math.min(12,Math.max(8,Math.min(bH,bw)*0.14))
    ctx.font=`500 ${fs}px DM Mono,monospace`;ctx.textAlign='center'
    let label=band.label
    while(ctx.measureText(label).width>bw-10&&label.length>4) label=label.slice(0,-2)+'…'
    ctx.fillText(label,0,fs*0.35);ctx.restore()
  }
}

function drawPlan(canvas, variant) {
  if (!canvas || !variant) return
  const dpr=window.devicePixelRatio||2
  const W=canvas.offsetWidth||320, H=canvas.offsetHeight||320
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr)
  ctx.clearRect(0,0,W,H)
  const PAD=20,dW=W-PAD*2,dH=H-PAD*2,pt=variant.planType||'central-core'
  ctx.fillStyle='#dde8f0';ctx.strokeStyle='#5a8a70';ctx.lineWidth=1.8
  ctx.fillRect(PAD,PAD,dW,dH);ctx.strokeRect(PAD,PAD,dW,dH)
  const sb=14;ctx.strokeStyle='rgba(74,112,85,0.28)';ctx.lineWidth=0.7;ctx.setLineDash([4,4])
  ctx.strokeRect(PAD+sb,PAD+sb,dW-sb*2,dH-sb*2);ctx.setLineDash([])
  const plans={
    'central-core':()=>{
      const cW=dW*0.22,cH=dH*0.30,cx=PAD+(dW-cW)/2,cy=PAD+(dH-cH)/2
      ctx.fillStyle='#d0ccc8';ctx.strokeStyle='#9a9690';ctx.lineWidth=1
      ctx.fillRect(cx,cy,cW,cH);ctx.strokeRect(cx,cy,cW,cH)
      ctx.fillStyle='#4a7055';ctx.font='8px DM Mono,monospace';ctx.textAlign='center'
      ctx.fillText('CORE',cx+cW/2,cy+cH*0.55+4)
      ctx.fillStyle='#1c3a52';ctx.font='9px DM Mono,monospace'
      ctx.fillText('OFFICE',PAD+dW/2,PAD+16);ctx.fillText('OFFICE',PAD+dW/2,PAD+dH-8)
    },
    'end-core':()=>{
      const cW=dW*0.20;ctx.fillStyle='#d0ccc8';ctx.strokeStyle='#9a9690';ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,cW,dH);ctx.strokeRect(PAD,PAD,cW,dH)
      ctx.fillStyle='#4a7055';ctx.font='8px DM Mono,monospace';ctx.textAlign='center'
      ctx.save();ctx.translate(PAD+cW/2,PAD+dH/2);ctx.rotate(-Math.PI/2);ctx.fillText('CORE',0,0);ctx.restore()
      ctx.fillStyle='#1c3a52';ctx.font='9px DM Mono,monospace';ctx.fillText('OPEN OFFICE',PAD+cW+(dW-cW)/2,PAD+dH/2)
    },
    'side-core':()=>{
      const cH=dH*0.20;ctx.fillStyle='#d0ccc8';ctx.strokeStyle='#9a9690';ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,dW,cH);ctx.strokeRect(PAD,PAD,dW,cH)
      ctx.fillStyle='#4a7055';ctx.font='8px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('CORE',PAD+dW/2,PAD+cH/2+3)
      ctx.fillStyle='#1c3a52';ctx.font='9px DM Mono,monospace';ctx.fillText('OPEN OFFICE PLATE',PAD+dW/2,PAD+cH+(dH-cH)/2)
    },
    'perimeter-core':()=>{
      const cSz=dW*0.13
      ;[[PAD,PAD],[PAD+dW-cSz,PAD],[PAD,PAD+dH-cSz],[PAD+dW-cSz,PAD+dH-cSz]].forEach(([x,y])=>{
        ctx.fillStyle='#d0ccc8';ctx.strokeStyle='#9a9690';ctx.lineWidth=1
        ctx.fillRect(x,y,cSz,cSz);ctx.strokeRect(x,y,cSz,cSz)
        ctx.fillStyle='#4a7055';ctx.font='7px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('C',x+cSz/2,y+cSz/2+3)
      })
      const aw=dW*0.36,ah=dH*0.38
      ctx.fillStyle='rgba(175,215,240,0.35)';ctx.strokeStyle='#6ab0d0';ctx.lineWidth=1.2;ctx.setLineDash([3,3])
      ctx.fillRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah);ctx.strokeRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah);ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a';ctx.font='9px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('ATRIUM',PAD+dW/2,PAD+dH/2)
    },
    'dual-core':()=>{
      const cW=dW*0.14,cH=dH*0.38
      ;[PAD+dW*0.2-cW/2,PAD+dW*0.8-cW/2].forEach(cx=>{
        ctx.fillStyle='#d0ccc8';ctx.strokeStyle='#9a9690';ctx.lineWidth=1
        ctx.fillRect(cx,PAD+(dH-cH)/2,cW,cH);ctx.strokeRect(cx,PAD+(dH-cH)/2,cW,cH)
        ctx.fillStyle='#4a7055';ctx.font='7px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('CORE',cx+cW/2,PAD+dH/2+3)
      })
      const gx=PAD+dW*0.38,gW=dW*0.24
      ctx.fillStyle='rgba(185,215,235,0.35)';ctx.strokeStyle='#6ab0d0';ctx.lineWidth=0.8;ctx.setLineDash([3,3])
      ctx.fillRect(gx,PAD,gW,dH);ctx.strokeRect(gx,PAD,gW,dH);ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a';ctx.font='8px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('VOID',gx+gW/2,PAD+dH/2)
    },
    'triple-core':()=>{
      [{x:0,w:0.3,h:0.38,l:'LOW'},{x:0.32,w:0.3,h:0.65,l:'MID'},{x:0.64,w:0.36,h:1.0,l:'MAIN'}].forEach(({x,w,h,l},i)=>{
        const bx=PAD+x*dW,bW=w*dW,bH=h*dH
        ctx.fillStyle=['#c4dce8','#b4d0e4','#a4c8e0'][i];ctx.strokeStyle='#5a8aaa';ctx.lineWidth=1
        ctx.fillRect(bx,PAD+dH-bH,bW,bH);ctx.strokeRect(bx,PAD+dH-bH,bW,bH)
        ctx.fillStyle='#1c3a52';ctx.font='8px DM Mono,monospace';ctx.textAlign='center';ctx.fillText(l,bx+bW/2,PAD+dH-bH+13)
      })
    },
  }
  ;(plans[pt]||plans['central-core'])()
  ctx.save();ctx.translate(W-PAD-14,PAD+14)
  ctx.fillStyle='#2d6a4f';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(3.5,0);ctx.lineTo(0,-4);ctx.lineTo(-3.5,0);ctx.closePath();ctx.fill()
  ctx.fillStyle='#adc5b5';ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(3.5,0);ctx.lineTo(0,4);ctx.lineTo(-3.5,0);ctx.closePath();ctx.fill()
  ctx.fillStyle='#2d6a4f';ctx.font='8px DM Mono,monospace';ctx.textAlign='center';ctx.fillText('N',0,-14);ctx.restore()
  ctx.fillStyle='#4a7055';ctx.font='8px DM Mono,monospace';ctx.textAlign='left';ctx.fillText('0    50ft',PAD,H-5)
}

export default function Step3Massing({ state, update, onNext, onBack }) {
  const sectionRef = useRef(null)
  const planRef    = useRef(null)
  const [activeTypology, setActiveTypology] = useState(state.massingType||'box')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [variants, setVariants] = useState([])
  const [view, setView] = useState('section')

  const programs  = state.selectedPrograms||[]
  const totalSF   = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA    = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW      = (state.lotW||120)-(state.sideSB||10)*2
  const envD      = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const maxFloors = Math.max(4,Math.round((state.heightMax||180)/14))
  const farUsed   = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)

  const loadVariants = useCallback((typoId)=>{
    const lib=VARIANT_LIBRARY[typoId]||[]
    const enriched=lib.map(v=>({...v,envW,envD,maxFloors}))
    setVariants(enriched)
    const first=enriched[0]||null
    setSelectedVariant(first)
    update({massingType:typoId,selectedMassingVariant:first?.name})
  },[envW,envD,maxFloors])

  useEffect(()=>{loadVariants(activeTypology)},[activeTypology])

  const redraw = useCallback(()=>{
    if (!selectedVariant) return
    const t=setTimeout(()=>{
      if((view==='section'||view==='both')&&sectionRef.current) drawSection(sectionRef.current,selectedVariant)
      if((view==='plan'   ||view==='both')&&planRef.current)    drawPlan(planRef.current,selectedVariant)
    },50)
    return()=>clearTimeout(t)
  },[selectedVariant,view])

  useEffect(()=>redraw(),[redraw])
  useEffect(()=>{window.addEventListener('resize',redraw);return()=>window.removeEventListener('resize',redraw)},[redraw])

  const selectVariant=(v)=>{setSelectedVariant(v);update({selectedMassingVariant:v.name,massingType:activeTypology})}
  const legendItems=selectedVariant?[...new Map(selectedVariant.sectionProfile.map(b=>[b.colorKey,b])).values()]:[]
  const totalPct=selectedVariant?.sectionProfile.reduce((s,b)=>s+b.floors,0)||1

  return (
    <div className="step-full" style={{flexDirection:'column'}}>
      <div className="massing-topbar">
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span className="step-title" style={{fontSize:20}}>Massing <em>proposal.</em></span>
          <span className="tag">Step 03</span>
        </div>
        <div className="typo-tabs">
          {TYPOLOGIES.map(t=>(
            <button key={t.id} className={`typo-tab ${activeTypology===t.id?'active':''}`} onClick={()=>setActiveTypology(t.id)}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:5}}>
          {[['section','Section'],['plan','Plan'],['both','Section + Plan']].map(([v,l])=>(
            <button key={v} className={`view-tab ${view===v?'active':''}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="massing-body">
        <div className="variant-list">
          <div className="section-head" style={{marginBottom:6}}>
            <span className="section-label">{TYPOLOGIES.find(t=>t.id===activeTypology)?.label}</span>
            <div className="section-line"/>
          </div>
          <p style={{fontSize:10,color:'var(--ink-dim)',lineHeight:1.5,marginBottom:10}}>{TYPOLOGIES.find(t=>t.id===activeTypology)?.desc}</p>
          {variants.map(v=>(
            <div key={v.name} className={`variant-card ${selectedVariant?.name===v.name?'active':''}`} onClick={()=>selectVariant(v)}>
              <div className="variant-card-top">
                <span className="variant-name">{v.name}</span>
                {selectedVariant?.name===v.name&&<span style={{fontSize:9,color:'var(--accent)',fontFamily:'var(--font-mono)'}}>●</span>}
              </div>
              <div className="variant-ref">{v.ref}</div>
              <p className="variant-note">{v.note}</p>
              {/* Mini preview — flex-direction:column so index 0 (ground) is at top of flex,
                  but we reverse display with column-reverse on the container */}
              <div className="variant-mini">
                {[...v.sectionProfile].reverse().map((b,bi)=>{
                  const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
                  return <div key={bi} style={{flex:b.floors,background:col.fill,borderTop:`1px solid ${col.stroke}`,minHeight:3}}/>
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="diagram-area">
          {(view==='section'||view==='both')&&(
            <div className={`canvas-wrap ${view==='both'?'half':''}`}>
              <div className="canvas-label">SECTION — lobby at bottom · crown at top</div>
              <canvas ref={sectionRef} className="diagram-canvas"/>
            </div>
          )}
          {(view==='plan'||view==='both')&&(
            <div className={`canvas-wrap ${view==='both'?'half':''}`}>
              <div className="canvas-label">TYPICAL FLOOR PLAN</div>
              <canvas ref={planRef} className="diagram-canvas"/>
            </div>
          )}
        </div>

        <div className="massing-sidebar">
          <div className="card-white" style={{marginBottom:10}}>
            <div className="section-label" style={{marginBottom:8}}>Constraints</div>
            {[
              {l:'GFA',     v:`${totalSF.toLocaleString()} / ${Math.round(maxGFA).toLocaleString()} sf`, ok:totalSF<=maxGFA},
              {l:'FAR',     v:`${farUsed} / ${state.farMax}`, ok:+farUsed<=state.farMax},
              {l:'Height',  v:`${maxFloors*14} / ${state.heightMax} ft`, ok:maxFloors*14<=state.heightMax},
              {l:'Envelope',v:`${envW}×${envD} ft`, ok:true},
            ].map(m=>(
              <div key={m.l} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:11,color:'var(--ink-mid)'}}>{m.l}</span>
                <div style={{display:'flex',gap:5}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:m.ok?'var(--accent)':'var(--red)'}}>{m.v}</span>
                  <span>{m.ok?'✓':'⚠'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card-white" style={{marginBottom:10}}>
            <div className="section-label" style={{marginBottom:8}}>Section legend</div>
            {legendItems.map(b=>{
              const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
              return(
                <div key={b.colorKey} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <div style={{width:14,height:9,background:col.fill,border:`1px solid ${col.stroke}`,borderRadius:2,flexShrink:0}}/>
                  <span style={{fontSize:11,color:'var(--ink-mid)',flex:1}}>{b.label}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>{Math.round(b.floors/totalPct*100)}%</span>
                </div>
              )
            })}
          </div>

          {programs.length>0&&(
            <div className="card-white" style={{marginBottom:10}}>
              <div className="section-label" style={{marginBottom:8}}>Your programmes</div>
              {programs.slice(0,9).map(p=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                  <span style={{fontSize:10,color:'var(--ink-mid)',flex:1}}>{p.label}</span>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-dim)'}}>{(p.sf||p.defaultSF||0).toLocaleString()}</span>
                </div>
              ))}
              {programs.length>9&&<div style={{fontSize:10,color:'var(--ink-ghost)',marginTop:2}}>+{programs.length-9} more</div>}
            </div>
          )}

          {selectedVariant&&(
            <div className="card-white" style={{marginBottom:10}}>
              <div className="section-label" style={{marginBottom:5}}>Selected</div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{selectedVariant.name}</div>
              <div style={{fontSize:10,color:'var(--gold)',fontFamily:'var(--font-mono)',marginBottom:6}}>{selectedVariant.ref}</div>
              <p style={{fontSize:11,color:'var(--ink-mid)',lineHeight:1.5}}>{selectedVariant.note}</p>
            </div>
          )}

          <div style={{display:'flex',gap:8,marginTop:'auto'}}>
            <button className="btn-ghost" onClick={onBack} style={{flex:1}}>← Back</button>
            <button className="btn-primary" onClick={onNext} style={{flex:2}}>Facade Design →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
