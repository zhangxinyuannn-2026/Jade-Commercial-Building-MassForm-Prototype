import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import './Step3Massing.css'

// ── TYPOLOGIES ───────────────────────────────────────────────────────────────
const TYPOLOGIES = [
  { id:'box',       label:'Box / Slab',      icon:'▬', desc:'Regular extruded volume — core placement variations' },
  { id:'taper',     label:'Taper / Spire',   icon:'▲', desc:'Upper floors reduce — light access, sky exposure' },
  { id:'stepped',   label:'Stepped',         icon:'⊏', desc:'Setback tiers with sky terraces at each step' },
  { id:'courtyard', label:'Courtyard',       icon:'◻', desc:'Central void — atrium, light wells, garden court' },
  { id:'cluster',   label:'Cluster / Split', icon:'◈', desc:'Multiple volumes linked by bridges or podium' },
]

// ── COLOUR MAP ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  office:    { fill:'#b8d4e8', stroke:'#5a92b8', text:'#1c3a52', hex:0x7aadcc },
  office2:   { fill:'#c4dff0', stroke:'#6ab0d0', text:'#1a3048', hex:0x8ac4dc },
  retail:    { fill:'#f7c97a', stroke:'#c8962e', text:'#3d2800', hex:0xe8a830 },
  amenity:   { fill:'#b4dfc4', stroke:'#4aaa74', text:'#0d3020', hex:0x60c080 },
  mech:      { fill:'#d4d0cc', stroke:'#9a9690', text:'#2a2822', hex:0xb0aaaa },
  rooftop:   { fill:'#e8c4a8', stroke:'#c07850', text:'#3a1800', hex:0xd09060 },
  highlight: { fill:'#ffc890', stroke:'#c08030', text:'#3a1a00', hex:0xf0a840 },
  void:      { fill:'rgba(200,220,235,0.3)', stroke:'#7a9aaa', text:'#4a6a7a', hex:0xa8c8dc },
  core:      { fill:'#e4ddd5', stroke:'#aa9880', text:'#3a2c1e', hex:0xc8bfb0 },
}

// ── VARIANT LIBRARY ───────────────────────────────────────────────────────────
// sectionProfile GROUND→ROOF: index 0 = lowest floor, last index = roof
const VARIANT_LIBRARY = {
  box: [
    {
      name:'Central Core', ref:'Seagram Building — Mies van der Rohe',
      note:'Core centred, equal perimeter offices on all sides. Maximum floor-plate efficiency.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail',  floors:0.10, colorKey:'retail'  },
        { xPct:0,   wPct:1.0, label:'Office',           floors:0.82, colorKey:'office'  },
        { xPct:0.1, wPct:0.8, label:'Mechanical / MEP',floors:0.08, colorKey:'mech'    },
      ], planType:'central-core',
    },
    {
      name:'Podium + Shaft', ref:'30 Hudson Yards — KPF',
      note:'Wide podium base (retail/amenity) + slender tower shaft. Strong urban street presence.',
      sectionProfile:[
        { xPct:0,    wPct:1.0, label:'Lobby / Retail', floors:0.08, colorKey:'retail'  },
        { xPct:0,    wPct:1.0, label:'Amenity Podium', floors:0.14, colorKey:'amenity' },
        { xPct:0.15, wPct:0.7, label:'Office Shaft',   floors:0.70, colorKey:'office'  },
        { xPct:0.25, wPct:0.5, label:'Crown / Plant',  floors:0.08, colorKey:'rooftop' },
      ], planType:'central-core',
    },
    {
      name:'Dual-Band', ref:'The Shard — Renzo Piano',
      note:'Horizontal programme bands clearly expressed. Trading / office / mechanical each visible.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail',  floors:0.10, colorKey:'retail'    },
        { xPct:0,   wPct:1.0, label:'Trading/Finance',  floors:0.20, colorKey:'highlight' },
        { xPct:0,   wPct:1.0, label:'Office',           floors:0.50, colorKey:'office'    },
        { xPct:0.1, wPct:0.8, label:'Mechanical',       floors:0.08, colorKey:'mech'      },
        { xPct:0.3, wPct:0.4, label:'Crown / Plant',    floors:0.12, colorKey:'rooftop'   },
      ], planType:'central-core',
    },
    {
      name:'End Core', ref:'Lever House — SOM',
      note:'Core at north end frees the south facade for maximum daylight and glazing.',
      sectionProfile:[
        { xPct:0,   wPct:1.0, label:'Lobby / Retail', floors:0.10, colorKey:'retail' },
        { xPct:0,   wPct:1.0, label:'Office',          floors:0.82, colorKey:'office' },
        { xPct:0.1, wPct:0.8, label:'Plant / MEP',     floors:0.08, colorKey:'mech'  },
      ], planType:'end-core',
    },
  ],
  taper: [
    {
      name:'Classic Taper', ref:'Empire State / Chrysler — Art Deco',
      note:'Gradual reduction from base to crown. Maximum FAR at lower floors; slender spire at top.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail', floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:0.95, label:'Office',          floors:0.30, colorKey:'office'  },
        { xPct:0.06, wPct:0.88, label:'Office',          floors:0.24, colorKey:'office2' },
        { xPct:0.14, wPct:0.72, label:'Office',          floors:0.20, colorKey:'office'  },
        { xPct:0.28, wPct:0.44, label:'Amenity / Sky',  floors:0.09, colorKey:'amenity' },
        { xPct:0.38, wPct:0.24, label:'Crown',           floors:0.05, colorKey:'rooftop' },
      ], planType:'central-core',
    },
    {
      name:'Pixelated Taper', ref:'MVRDV / BIG — pixel tower',
      note:'Irregular steps create external terraces. Each step a different programme.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Retail / Lobby', floors:0.10, colorKey:'retail'   },
        { xPct:0,    wPct:0.90, label:'Office',          floors:0.22, colorKey:'office'   },
        { xPct:0.05, wPct:0.80, label:'Office',          floors:0.18, colorKey:'office2'  },
        { xPct:0.12, wPct:0.65, label:'Amenity Terrace',floors:0.08, colorKey:'amenity'  },
        { xPct:0.12, wPct:0.52, label:'Office',          floors:0.24, colorKey:'office'   },
        { xPct:0.24, wPct:0.30, label:'Sky Lounge',      floors:0.10, colorKey:'rooftop'  },
        { xPct:0.32, wPct:0.16, label:'Crown / Spire',  floors:0.08, colorKey:'mech'     },
      ], planType:'end-core',
    },
    {
      name:'Chamfered Tower', ref:'122 Leadenhall — Rogers Stirk Harbour',
      note:'Diagonal chamfer reduces bulk at street level while maximising crown views.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail', floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office',          floors:0.42, colorKey:'office'  },
        { xPct:0.06, wPct:0.94, label:'Office',          floors:0.22, colorKey:'office2' },
        { xPct:0.16, wPct:0.78, label:'Office + Amen.',  floors:0.18, colorKey:'amenity' },
        { xPct:0.36, wPct:0.50, label:'Crown',           floors:0.08, colorKey:'rooftop' },
      ], planType:'side-core',
    },
    {
      name:'Inverted Taper', ref:'CCTV HQ — OMA',
      note:'Wider at top than base — cantilevered upper floors. Structurally expressive.',
      sectionProfile:[
        { xPct:0.22, wPct:0.56, label:'Lobby / Entry',  floors:0.10, colorKey:'retail'  },
        { xPct:0.14, wPct:0.72, label:'Office',          floors:0.28, colorKey:'office'  },
        { xPct:0.06, wPct:0.88, label:'Office',          floors:0.30, colorKey:'office2' },
        { xPct:0,    wPct:1.0,  label:'Amenity / Sky',  floors:0.20, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Crown Garden',   floors:0.12, colorKey:'rooftop' },
      ], planType:'central-core',
    },
  ],
  stepped: [
    {
      name:'Skyline Steps', ref:'Rockefeller Center — Harrison & Abramovitz',
      note:'Three distinct setbacks create sky terraces. Publicly accessible amenity at each step.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Retail / Lobby',  floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Lower Office',     floors:0.20, colorKey:'office'  },
        { xPct:0,    wPct:1.0,  label:'Sky Terrace 1',   floors:0.05, colorKey:'amenity' },
        { xPct:0.12, wPct:0.76, label:'Mid Office',       floors:0.26, colorKey:'office2' },
        { xPct:0.12, wPct:0.76, label:'Sky Terrace 2',   floors:0.05, colorKey:'amenity' },
        { xPct:0.26, wPct:0.48, label:'Upper Office',     floors:0.20, colorKey:'office'  },
        { xPct:0.36, wPct:0.28, label:'Crown / Plant',   floors:0.12, colorKey:'rooftop' },
      ], planType:'central-core',
    },
    {
      name:'Cascading Terraces', ref:'One Angel Square — BDP',
      note:'Steps cascade towards south for solar access. Planted outdoor terraces at each level.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Ground Activation',floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office Band 1',    floors:0.18, colorKey:'office'  },
        { xPct:0.08, wPct:0.84, label:'Office Band 2',    floors:0.18, colorKey:'office2' },
        { xPct:0.18, wPct:0.68, label:'Terrace + Office', floors:0.22, colorKey:'office'  },
        { xPct:0.30, wPct:0.52, label:'Amenity Floor',    floors:0.10, colorKey:'amenity' },
        { xPct:0.30, wPct:0.40, label:'Upper Office',     floors:0.22, colorKey:'office2' },
      ], planType:'end-core',
    },
    {
      name:'Pixelated Stack', ref:'VIA 57 West — BIG',
      note:'Irregular programme blocks create variety. Each step a different use with distinct facade.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Parking / Lobby', floors:0.10, colorKey:'mech'     },
        { xPct:0,    wPct:0.90, label:'Co-Working',       floors:0.12, colorKey:'highlight'},
        { xPct:0,    wPct:0.76, label:'Office',           floors:0.22, colorKey:'office'   },
        { xPct:0.10, wPct:0.64, label:'Amenity Sky',      floors:0.08, colorKey:'amenity'  },
        { xPct:0.22, wPct:0.54, label:'Office Tower',     floors:0.28, colorKey:'office2'  },
        { xPct:0.32, wPct:0.34, label:'Rooftop Lounge',  floors:0.20, colorKey:'rooftop'  },
      ], planType:'side-core',
    },
  ],
  courtyard: [
    {
      name:'Central Atrium', ref:"Lloyd's of London — Richard Rogers",
      note:'Internal atrium floods all floors with daylight. Cores pushed to perimeter.',
      sectionProfile:[
        { xPct:0,    wPct:0.30, label:'Office Wing W',   floors:1.0, colorKey:'office'  },
        { xPct:0.35, wPct:0.30, label:'Atrium Void',     floors:1.0, colorKey:'void'    },
        { xPct:0.70, wPct:0.30, label:'Office Wing E',   floors:1.0, colorKey:'office2' },
      ], planType:'perimeter-core',
    },
    {
      name:'Sky Garden Core', ref:'The Gherkin — Foster + Partners',
      note:'Sky gardens inserted every 8–10 floors for natural ventilation and wellbeing.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Lobby / Retail',  floors:0.10, colorKey:'retail'  },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.18, colorKey:'office'  },
        { xPct:0.05, wPct:0.90, label:'Sky Garden 1',    floors:0.06, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.20, colorKey:'office2' },
        { xPct:0.05, wPct:0.90, label:'Sky Garden 2',    floors:0.06, colorKey:'amenity' },
        { xPct:0,    wPct:1.0,  label:'Office',           floors:0.24, colorKey:'office'  },
        { xPct:0.20, wPct:0.60, label:'Crown Terrace',   floors:0.16, colorKey:'rooftop' },
      ], planType:'perimeter-core',
    },
    {
      name:'Split Courtyard', ref:'Tencent HQ — NBBJ',
      note:'Building splits into two slabs framing a shared courtyard garden.',
      sectionProfile:[
        { xPct:0,    wPct:0.42, label:'Tower A',          floors:1.0,  colorKey:'office'  },
        { xPct:0.44, wPct:0.14, label:'Courtyard',        floors:0.30, colorKey:'void'    },
        { xPct:0.44, wPct:0.14, label:'Sky Bridge',       floors:0.15, colorKey:'amenity' },
        { xPct:0.60, wPct:0.40, label:'Tower B',          floors:0.88, colorKey:'office2' },
      ], planType:'dual-core',
    },
  ],
  cluster: [
    {
      name:'Podium + Twin Towers', ref:'One & Two WTC — podium base',
      note:'Shared podium unites two towers of different heights. Creates public address.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Shared Podium',   floors:0.12, colorKey:'retail'  },
        { xPct:0,    wPct:0.42, label:'Tower A',          floors:0.78, colorKey:'office'  },
        { xPct:0.58, wPct:0.42, label:'Tower B (tall)',  floors:0.98, colorKey:'office2' },
        { xPct:0.16, wPct:0.66, label:'Sky Bridge',       floors:0.05, colorKey:'amenity' },
      ], planType:'dual-core',
    },
    {
      name:'Asymmetric Cluster', ref:'Tour Carpe Diem — Morphosis',
      note:'Three volumes of different heights — tallest at corner, stepping down to street.',
      sectionProfile:[
        { xPct:0,    wPct:1.0,  label:'Ground Podium',   floors:0.10, colorKey:'amenity' },
        { xPct:0,    wPct:0.32, label:'Low-rise Vol.',    floors:0.28, colorKey:'retail'  },
        { xPct:0.34, wPct:0.30, label:'Mid Tower',        floors:0.58, colorKey:'office2' },
        { xPct:0.66, wPct:0.34, label:'Main Tower',       floors:0.92, colorKey:'office'  },
      ], planType:'triple-core',
    },
    {
      name:'Linked Volumes', ref:'Bloomberg HQ London — Foster + Partners',
      note:'Two offset slabs linked at mid-level by connecting sky bridge.',
      sectionProfile:[
        { xPct:0,    wPct:0.44, label:'Slab A',           floors:0.92, colorKey:'office'    },
        { xPct:0.44, wPct:0.12, label:'Void / Bridge',    floors:0.35, colorKey:'void'      },
        { xPct:0.56, wPct:0.44, label:'Slab B',           floors:1.0,  colorKey:'office2'   },
        { xPct:0.16, wPct:0.68, label:'Connecting Bridge',floors:0.08, colorKey:'highlight' },
      ], planType:'dual-core',
    },
  ],
}

// ── 2D SECTION DRAW ─────────────────────────────────────────────────────────
// Ground = bottom of canvas, Roof = top. Uses canvas transform so Y=0 is ground.
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

  const PL=62, PR=18, PT=42, PB=52
  const dW = W-PL-PR, dH = H-PT-PB

  // flip Y so y=0 is at ground level (bottom of drawing area)
  ctx.save()
  ctx.translate(PL, PT + dH) // origin = bottom-left of drawing area
  ctx.scale(1, -1)            // flip vertical

  // Sky (now drawn at top because Y is flipped)
  const skyG = ctx.createLinearGradient(0, 0, 0, dH)
  skyG.addColorStop(0, 'rgba(185,210,232,0)')
  skyG.addColorStop(1, 'rgba(185,210,232,0.2)')
  ctx.fillStyle = skyG
  ctx.fillRect(0, 0, dW, dH)

  const profile  = variant.sectionProfile   // already GROUND→ROOF
  const totalPct = profile.reduce((s,b) => s + b.floors, 0)
  const isParallel = ['dual-core','perimeter-core','triple-core'].includes(variant.planType)

  if (isParallel) {
    // Each band is an independent column — height relative to total building height
    profile.forEach(band => {
      const colH = (band.floors / 1.0) * dH
      const bx   = band.xPct * dW
      const bw   = band.wPct * dW
      drawBandFlipped(ctx, bx, 0, bw, colH, band)
    })
  } else {
    // Stacked — draw from ground (y=0) upward
    let y = 0
    profile.forEach(band => {
      const bH = (band.floors / totalPct) * dH
      const bx = band.xPct * dW
      const bw = band.wPct * dW
      drawBandFlipped(ctx, bx, y, bw, bH, band)
      y += bH
    })
  }

  ctx.restore() // undo flip

  // Ground line & hatching (in normal coords)
  ctx.fillStyle = '#7aaa82'
  ctx.fillRect(PL-14, PT+dH, dW+28, 3)
  ctx.strokeStyle = 'rgba(80,120,80,0.18)'; ctx.lineWidth = 0.8
  for (let i=1; i<5; i++) {
    ctx.beginPath()
    ctx.moveTo(PL-14, PT+dH+3+i*4)
    ctx.lineTo(PL+dW+14, PT+dH+3+i*4)
    ctx.stroke()
  }

  // Height dimension (left)
  const dimX = PL - 28
  ctx.strokeStyle = '#4a7055'; ctx.lineWidth = 0.9; ctx.setLineDash([3,3])
  ctx.beginPath(); ctx.moveTo(dimX, PT); ctx.lineTo(dimX, PT+dH); ctx.stroke()
  ctx.setLineDash([])
  ;[[PT,-1],[PT+dH,1]].forEach(([y,dir]) => {
    ctx.fillStyle='#4a7055'
    ctx.beginPath(); ctx.moveTo(dimX,y); ctx.lineTo(dimX-4,y+dir*7); ctx.lineTo(dimX+4,y+dir*7); ctx.closePath(); ctx.fill()
  })
  ctx.save()
  ctx.fillStyle='#2d6a4f'; ctx.font='500 11px DM Mono,monospace'; ctx.textAlign='center'
  ctx.translate(dimX-14, PT+dH/2); ctx.rotate(-Math.PI/2)
  ctx.fillText(`${variant.maxFloors||20}F  /  ${(variant.maxFloors||20)*14}ft`, 0, 0)
  ctx.restore()

  // Width dimension (bottom)
  const dimY = PT+dH+20
  ctx.strokeStyle='#4a7055'; ctx.lineWidth=0.9; ctx.setLineDash([3,3])
  ctx.beginPath(); ctx.moveTo(PL,dimY); ctx.lineTo(PL+dW,dimY); ctx.stroke()
  ctx.setLineDash([])
  ;[[PL,-1],[PL+dW,1]].forEach(([x,dir]) => {
    ctx.fillStyle='#4a7055'
    ctx.beginPath(); ctx.moveTo(x,dimY); ctx.lineTo(x+dir*7,dimY-4); ctx.lineTo(x+dir*7,dimY+4); ctx.closePath(); ctx.fill()
  })
  ctx.fillStyle='#2d6a4f'; ctx.font='11px DM Mono,monospace'; ctx.textAlign='center'
  ctx.fillText(`${variant.envW||100} ft`, PL+dW/2, dimY+16)

  // Title
  ctx.fillStyle='#1c2e20'; ctx.font='bold 12px DM Mono,monospace'; ctx.textAlign='left'
  ctx.fillText(variant.name||'', PL, PT-20)
  ctx.fillStyle='#7a9e85'; ctx.font='10px DM Mono,monospace'
  ctx.fillText(variant.ref||'', PL, PT-8)
}

function drawBandFlipped(ctx, bx, by, bw, bH, band) {
  if (bH < 1 || bw < 1) return
  const col = COLOR_MAP[band.colorKey] || COLOR_MAP.office

  if (band.colorKey === 'void') {
    ctx.save()
    ctx.beginPath(); ctx.rect(bx, by, bw, bH); ctx.clip()
    ctx.fillStyle = 'rgba(200,218,232,0.22)'; ctx.fillRect(bx, by, bw, bH)
    // Hatching — drawn in flipped coords so it goes the right way
    ctx.strokeStyle = 'rgba(90,130,155,0.22)'; ctx.lineWidth = 0.9; ctx.setLineDash([5,4])
    for (let d = -bH; d < bw+bH; d += 10) {
      ctx.beginPath(); ctx.moveTo(bx+d, by); ctx.lineTo(bx+d+bH, by+bH); ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.restore()
  } else {
    ctx.fillStyle = col.fill
    ctx.fillRect(bx, by, bw, bH)
  }

  ctx.strokeStyle = col.stroke; ctx.lineWidth = 1.2
  ctx.strokeRect(bx+0.6, by+0.6, bw-1.2, bH-1.2)

  // Floor lines
  if (!['void','mech','core'].includes(band.colorKey) && bH > 20) {
    const fCount = Math.max(2, Math.round(band.floors * 4))
    ctx.strokeStyle = col.stroke + '44'; ctx.lineWidth = 0.5
    for (let f=1; f<fCount; f++) {
      const fy = by + (f/fCount)*bH
      ctx.beginPath(); ctx.moveTo(bx+2, fy); ctx.lineTo(bx+bw-2, fy); ctx.stroke()
    }
  }

  // Label — text needs un-flipping
  if (bH > 16) {
    ctx.save()
    const labelX = bx + bw/2
    const labelY = by + bH/2
    ctx.translate(labelX, labelY)
    ctx.scale(1, -1) // flip text back right-side-up
    ctx.fillStyle = col.text
    const fs = Math.min(12, Math.max(8, Math.min(bH, bw) * 0.14))
    ctx.font = `500 ${fs}px DM Mono, monospace`
    ctx.textAlign = 'center'
    const maxW = bw - 10
    let label = band.label
    while (ctx.measureText(label).width > maxW && label.length > 4) label = label.slice(0,-2)+'…'
    ctx.fillText(label, 0, fs*0.35)
    ctx.restore()
  }
}

// ── PLAN VIEW ────────────────────────────────────────────────────────────────
function drawPlan(canvas, variant) {
  if (!canvas || !variant) return
  const dpr = window.devicePixelRatio || 2
  const W = canvas.offsetWidth || 320
  const H = canvas.offsetHeight || 320
  canvas.width  = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0,0,W,H)

  const PAD=20, dW=W-PAD*2, dH=H-PAD*2
  const pt = variant.planType||'central-core'

  ctx.fillStyle='#dde8f0'; ctx.strokeStyle='#5a8a70'; ctx.lineWidth=1.8
  ctx.fillRect(PAD,PAD,dW,dH); ctx.strokeRect(PAD,PAD,dW,dH)

  const sb=14; ctx.strokeStyle='rgba(74,112,85,0.28)'; ctx.lineWidth=0.7; ctx.setLineDash([4,4])
  ctx.strokeRect(PAD+sb,PAD+sb,dW-sb*2,dH-sb*2); ctx.setLineDash([])

  const plans = {
    'central-core': () => {
      const cW=dW*0.22, cH=dH*0.30, cx=PAD+(dW-cW)/2, cy=PAD+(dH-cH)/2
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ctx.fillRect(cx,cy,cW,cH); ctx.strokeRect(cx,cy,cW,cH)
      for (let i=0;i<4;i++) { ctx.strokeStyle='#8a9890'; ctx.lineWidth=0.5; ctx.strokeRect(cx+2+i*(cW-4)/4,cy+3,(cW-4)/4-1,cH*0.38) }
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
      ctx.fillText('CORE',cx+cW/2,cy+cH*0.55+4)
      ctx.fillStyle='#1c3a52'; ctx.font='9px DM Mono,monospace'
      ctx.fillText('OFFICE',PAD+dW/2,PAD+16); ctx.fillText('OFFICE',PAD+dW/2,PAD+dH-8)
    },
    'end-core': () => {
      const cW=dW*0.20
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,cW,dH); ctx.strokeRect(PAD,PAD,cW,dH)
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
      ctx.save(); ctx.translate(PAD+cW/2,PAD+dH/2); ctx.rotate(-Math.PI/2); ctx.fillText('CORE',0,0); ctx.restore()
      ctx.fillStyle='#1c3a52'; ctx.font='9px DM Mono,monospace'
      ctx.fillText('OPEN OFFICE',PAD+cW+(dW-cW)/2,PAD+dH/2)
    },
    'side-core': () => {
      const cH=dH*0.20
      ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
      ctx.fillRect(PAD,PAD,dW,cH); ctx.strokeRect(PAD,PAD,dW,cH)
      ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
      ctx.fillText('CORE',PAD+dW/2,PAD+cH/2+3)
      ctx.fillStyle='#1c3a52'; ctx.font='9px DM Mono,monospace'
      ctx.fillText('OPEN OFFICE PLATE',PAD+dW/2,PAD+cH+(dH-cH)/2)
    },
    'perimeter-core': () => {
      const cSz=dW*0.13
      ;[[PAD,PAD],[PAD+dW-cSz,PAD],[PAD,PAD+dH-cSz],[PAD+dW-cSz,PAD+dH-cSz]].forEach(([x,y])=>{
        ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
        ctx.fillRect(x,y,cSz,cSz); ctx.strokeRect(x,y,cSz,cSz)
        ctx.fillStyle='#4a7055'; ctx.font='7px DM Mono,monospace'; ctx.textAlign='center'
        ctx.fillText('C',x+cSz/2,y+cSz/2+3)
      })
      const aw=dW*0.36, ah=dH*0.38
      ctx.fillStyle='rgba(175,215,240,0.35)'; ctx.strokeStyle='#6ab0d0'; ctx.lineWidth=1.2; ctx.setLineDash([3,3])
      ctx.fillRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah); ctx.strokeRect(PAD+(dW-aw)/2,PAD+(dH-ah)/2,aw,ah); ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a'; ctx.font='9px DM Mono,monospace'; ctx.textAlign='center'
      ctx.fillText('ATRIUM',PAD+dW/2,PAD+dH/2+3); ctx.fillText('VOID',PAD+dW/2,PAD+dH/2+13)
      ctx.fillStyle='#1c3a52'; ctx.fillText('OFFICE RING',PAD+dW/2,PAD+17)
    },
    'dual-core': () => {
      const cW=dW*0.14, cH=dH*0.38
      ;[PAD+dW*0.2-cW/2, PAD+dW*0.8-cW/2].forEach(cx=>{
        ctx.fillStyle='#d0ccc8'; ctx.strokeStyle='#9a9690'; ctx.lineWidth=1
        ctx.fillRect(cx,PAD+(dH-cH)/2,cW,cH); ctx.strokeRect(cx,PAD+(dH-cH)/2,cW,cH)
        ctx.fillStyle='#4a7055'; ctx.font='7px DM Mono,monospace'; ctx.textAlign='center'
        ctx.fillText('CORE',cx+cW/2,PAD+dH/2+3)
      })
      ctx.fillStyle='rgba(185,215,235,0.35)'; ctx.strokeStyle='#6ab0d0'; ctx.lineWidth=0.8; ctx.setLineDash([3,3])
      const gx=PAD+dW*0.38, gW=dW*0.24
      ctx.fillRect(gx,PAD,gW,dH); ctx.strokeRect(gx,PAD,gW,dH); ctx.setLineDash([])
      ctx.fillStyle='#2d6a8a'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
      ctx.fillText('VOID',gx+gW/2,PAD+dH/2+3)
    },
    'triple-core': () => {
      [{x:0,w:0.3,h:0.38,l:'LOW'},{x:0.32,w:0.3,h:0.65,l:'MID'},{x:0.64,w:0.36,h:1.0,l:'MAIN'}].forEach(({x,w,h,l},i)=>{
        const bx=PAD+x*dW, bW=w*dW, bH=h*dH
        ctx.fillStyle=['#c4dce8','#b4d0e4','#a4c8e0'][i]; ctx.strokeStyle='#5a8aaa'; ctx.lineWidth=1
        ctx.fillRect(bx,PAD+dH-bH,bW,bH); ctx.strokeRect(bx,PAD+dH-bH,bW,bH)
        ctx.fillStyle='#1c3a52'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'
        ctx.fillText(l,bx+bW/2,PAD+dH-bH+13)
      })
    },
  }
  ;(plans[pt]||plans['central-core'])()

  // North arrow
  ctx.save(); ctx.translate(W-PAD-14,PAD+14)
  ctx.fillStyle='#2d6a4f'; ctx.beginPath(); ctx.moveTo(0,-11); ctx.lineTo(3.5,0); ctx.lineTo(0,-4); ctx.lineTo(-3.5,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#adc5b5'; ctx.beginPath(); ctx.moveTo(0,11); ctx.lineTo(3.5,0); ctx.lineTo(0,4); ctx.lineTo(-3.5,0); ctx.closePath(); ctx.fill()
  ctx.fillStyle='#2d6a4f'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center'; ctx.fillText('N',0,-14); ctx.restore()

  ctx.fillStyle='#4a7055'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='left'
  ctx.fillText('0    50ft', PAD, H-5)
}

// ── 3D ENGINE ─────────────────────────────────────────────────────────────────
const SCALE3D = 0.055
function getSunAlt(h, m) {
  const dec = 23.45*Math.sin((360/365*(284+m*30.5-15))*Math.PI/180)
  const ha = (h-12)*15
  const sinAlt = Math.sin(40.7*Math.PI/180)*Math.sin(dec*Math.PI/180)+Math.cos(40.7*Math.PI/180)*Math.cos(dec*Math.PI/180)*Math.cos(ha*Math.PI/180)
  return Math.asin(sinAlt)*180/Math.PI
}

function NorthArrow({ orientation }) {
  const dirs = {N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315}
  const rot = dirs[orientation]||0
  return (
    <div style={{position:'absolute',bottom:12,right:12,width:48,height:48,background:'rgba(237,243,248,0.9)',border:'1px solid var(--border-mid)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <g transform={`rotate(${rot},18,18)`}>
          <polygon points="18,4 22,18 18,15 14,18" fill="var(--accent)" />
          <polygon points="18,32 22,18 18,21 14,18" fill="var(--ink-ghost)" />
          <circle cx="18" cy="18" r="2" fill="var(--accent)" />
        </g>
        <text x="18" y="36" textAnchor="middle" fontSize="7" fontFamily="DM Mono,monospace" fill="var(--ink-dim)">N</text>
      </svg>
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Step3Massing({ state, update, onNext, onBack }) {
  const sectionRef = useRef(null)
  const planRef    = useRef(null)
  const canvasRef  = useRef(null)   // Three.js canvas
  const sceneRef   = useRef({})

  const [activeTypology, setActiveTypology] = useState(state.massingType||'box')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [variants, setVariants] = useState([])
  const [mode, setMode] = useState('2d')  // '2d' | '3d'
  const [view2d, setView2d] = useState('section')
  const [sunShow, setSunShow] = useState(false)
  const [sunHour, setSunHour] = useState(12)
  const [sunMonth, setSunMonth] = useState(6)
  const [massingShape, setMassingShape] = useState('box')
  const [taperPct, setTaperPct] = useState(0.6)
  const [stepCount, setStepCount] = useState(3)
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const programs  = state.selectedPrograms||[]
  const totalSF   = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)
  const maxGFA    = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW      = (state.lotW||120)-(state.sideSB||10)*2
  const envD      = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const maxFloors = Math.max(4,Math.round((state.heightMax||180)/14))
  const farUsed   = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)

  // Load variants
  const loadVariants = useCallback((typoId) => {
    const lib = VARIANT_LIBRARY[typoId]||[]
    const enriched = lib.map(v=>({...v,envW,envD,maxFloors}))
    setVariants(enriched)
    const first = enriched[0]||null
    setSelectedVariant(first)
    update({massingType:typoId, selectedMassingVariant:first?.name})
  },[envW,envD,maxFloors])

  useEffect(()=>{ loadVariants(activeTypology) },[activeTypology])

  // 2D redraw
  const redraw2D = useCallback(()=>{
    if (!selectedVariant || mode!=='2d') return
    const t = setTimeout(()=>{
      if ((view2d==='section'||view2d==='both') && sectionRef.current) drawSection(sectionRef.current, selectedVariant)
      if ((view2d==='plan'   ||view2d==='both') && planRef.current)    drawPlan(planRef.current, selectedVariant)
    }, 50)
    return ()=>clearTimeout(t)
  },[selectedVariant,view2d,mode])

  useEffect(()=>redraw2D(),[redraw2D])
  useEffect(()=>{ window.addEventListener('resize',redraw2D); return ()=>window.removeEventListener('resize',redraw2D) },[redraw2D])

  // 3D init
  useEffect(()=>{
    if (mode!=='3d') return
    const canvas = canvasRef.current; if (!canvas) return
    const wrap = canvas.parentElement
    const W=wrap.clientWidth, H=wrap.clientHeight
    const renderer = new THREE.WebGLRenderer({canvas,antialias:true})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.setSize(W,H); renderer.setClearColor(0xb8cdd8,1)
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xb8cdd8,0.008)
    const camera = new THREE.PerspectiveCamera(42,W/H,0.1,600)
    camera.position.set(22,18,28); camera.lookAt(0,6,0)

    scene.add(new THREE.AmbientLight(0xd0e4f0,0.9))
    const sun = new THREE.DirectionalLight(0xfff5e0,1.2)
    sun.position.set(12,28,14); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun)
    scene.add(new THREE.DirectionalLight(0xe8f4ff,0.35).position.set(-8,4,-8).clone().updateMatrixWorld()&&new THREE.DirectionalLight(0xe8f4ff,0.35))

    const gnd=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshLambertMaterial({color:0xa8bfd0}))
    gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; scene.add(gnd)
    scene.add(new THREE.GridHelper(120,60,0x8aaabf,0x8aaabf))

    const buildingGroup=new THREE.Group(), envelopeGroup=new THREE.Group(), shadowGroup=new THREE.Group()
    scene.add(envelopeGroup,buildingGroup,shadowGroup)
    sceneRef.current={renderer,scene,camera,buildingGroup,envelopeGroup,shadowGroup,sun}

    let drag=false,lx=0,ly=0,theta=0.6,phi=0.52,radius=34
    canvas.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY})
    window.addEventListener('mouseup',()=>{drag=false})
    window.addEventListener('mousemove',e=>{
      if(!drag)return
      theta-=(e.clientX-lx)*0.007; phi=Math.max(0.1,Math.min(1.45,phi-(e.clientY-ly)*0.007))
      lx=e.clientX;ly=e.clientY
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.cos(theta))
      camera.lookAt(0,6,0)
    })
    canvas.addEventListener('wheel',e=>{radius=Math.max(10,Math.min(80,radius+e.deltaY*0.05));camera.position.setLength(radius)})

    const handleResize=()=>{const W2=wrap.clientWidth,H2=wrap.clientHeight;renderer.setSize(W2,H2);camera.aspect=W2/H2;camera.updateProjectionMatrix()}
    window.addEventListener('resize',handleResize)

    let animId; const animate=()=>{animId=requestAnimationFrame(animate);renderer.render(scene,camera)}; animate()
    return ()=>{window.removeEventListener('resize',handleResize);cancelAnimationFrame(animId);renderer.dispose()}
  },[mode])

  // 3D scene rebuild
  useEffect(()=>{
    const {buildingGroup,envelopeGroup,shadowGroup}=sceneRef.current
    if (!buildingGroup||mode!=='3d') return
    const clear=g=>{while(g.children.length)g.remove(g.children[0])}
    clear(buildingGroup);clear(envelopeGroup);clear(shadowGroup)

    const lw=(state.lotW||120)*SCALE3D, ld=(state.lotD||160)*SCALE3D
    const sbf=(state.frontSB||15)*SCALE3D, sbs=(state.sideSB||10)*SCALE3D, sbr=(state.rearSB||20)*SCALE3D
    const ew=lw-sbs*2, ed=ld-sbf-sbr, cy=(sbf-sbr)/2
    const hMax=(state.heightMax||180)*SCALE3D

    // Lot & envelope lines
    const addEdge=(geo,col,pos)=>{const m=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:col}));if(pos)m.position.copy(pos);envelopeGroup.add(m)}
    addEdge(new THREE.EdgesGeometry(new THREE.BoxGeometry(lw,0.01,ld)),0x7a9e85,new THREE.Vector3(0,0.005,0))
    addEdge(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew,0.01,ed)),0x2d6a4f,new THREE.Vector3(0,0.01,cy))
    const envMesh=new THREE.Mesh(new THREE.BoxGeometry(ew,hMax,ed),new THREE.MeshBasicMaterial({color:0x4a7055,transparent:true,opacity:0.05}))
    envMesh.position.set(0,hMax/2,cy); envelopeGroup.add(envMesh)
    const envWire=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(ew,hMax,ed)),new THREE.LineBasicMaterial({color:0x2d6a4f,transparent:true,opacity:0.2}))
    envWire.position.copy(envMesh.position); envelopeGroup.add(envWire)

    // Programs stacked bottom→top (ground floor first)
    const progs = programs.length>0 ? programs : [{label:'Office',color:'#3b82f6',sf:totalSF||5000,floorH:14}]
    let yOffset=0
    progs.forEach((prog,i)=>{
      const progH=(prog.floorH||13)*SCALE3D
      let fw=ew, fd=ed
      const t=i/Math.max(progs.length-1,1)
      if(massingShape==='taper'){const f=1-(1-taperPct)*t;fw=ew*f;fd=ed*f}
      else if(massingShape==='step'){const tier=Math.floor(i/Math.ceil(progs.length/stepCount));const s=Math.max(0.35,1-tier*0.6/Math.max(stepCount-1,1));fw=ew*s;fd=ed*s}
      else if(massingShape==='solar'){const c=Math.max(0,t-0.35)*1.5;fw=ew*Math.max(0.4,1-c*0.4)}
      else if(massingShape==='podium'){if(i<3){fw=ew;fd=ed}else{fw=ew*0.55;fd=ed*0.7}}

      const col=new THREE.Color(prog.color||'#3b82f6')
      col.multiplyScalar(0.65+0.35*(1-t*0.3))
      const geo=new THREE.BoxGeometry(fw,progH*0.96,fd)
      const mat=new THREE.MeshLambertMaterial({color:col})
      const mesh=new THREE.Mesh(geo,mat)
      mesh.position.set(0,yOffset+progH/2,cy)
      mesh.castShadow=true; buildingGroup.add(mesh)
      const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.12}))
      wire.position.copy(mesh.position); buildingGroup.add(wire)
      yOffset+=progH
    })

    // Sun shadow
    if(sunShow){
      const alt=getSunAlt(sunHour,sunMonth)
      if(alt>2){
        const az=(sunHour-6)/14*Math.PI, sl=(yOffset)/Math.tan(alt*Math.PI/180)
        const sx=Math.sin(az)*sl, sz=Math.cos(az)*sl
        const sMesh=new THREE.Mesh(new THREE.PlaneGeometry(ew+Math.abs(sx)*0.3+0.5,ed+Math.abs(sz)*0.3+0.5),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.18,depthWrite:false}))
        sMesh.rotation.x=-Math.PI/2; sMesh.position.set(sx*0.5,0.02,cy+sz*0.5); shadowGroup.add(sMesh)
      }
    }
  },[programs,massingShape,taperPct,stepCount,sunShow,sunHour,sunMonth,mode,state])

  const setView3D=(v)=>{
    const{camera}=sceneRef.current;if(!camera)return
    if(v==='top'){camera.position.set(0,50,0.01);camera.lookAt(0,0,0)}
    else if(v==='south'){camera.position.set(0,14,38);camera.lookAt(0,10,0)}
    else{camera.position.set(22,18,28);camera.lookAt(0,6,0)}
  }

  const selectVariant=(v)=>{setSelectedVariant(v);update({selectedMassingVariant:v.name,massingType:activeTypology})}

  const legendItems=selectedVariant?[...new Map(selectedVariant.sectionProfile.map(b=>[b.colorKey,b])).values()]:[]
  const totalPct = selectedVariant?.sectionProfile.reduce((s,b)=>s+b.floors,0)||1

  return (
    <div className="step-full" style={{flexDirection:'column'}}>
      {/* Top bar */}
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
        <div style={{display:'flex',gap:5,alignItems:'center'}}>
          {/* 2D/3D toggle */}
          <div className="mode-toggle">
            <button className={mode==='2d'?'active':''} onClick={()=>setMode('2d')}>2D Diagram</button>
            <button className={mode==='3d'?'active':''} onClick={()=>setMode('3d')}>3D Model</button>
          </div>
          {mode==='2d' && [['section','Section'],['plan','Plan'],['both','Both']].map(([v,l])=>(
            <button key={v} className={`view-tab ${view2d===v?'active':''}`} onClick={()=>setView2d(v)}>{l}</button>
          ))}
          {mode==='3d' && <>
            <button className="view-tab" onClick={()=>setView3D('iso')}>Iso</button>
            <button className="view-tab" onClick={()=>setView3D('top')}>Top</button>
            <button className="view-tab" onClick={()=>setView3D('south')}>South</button>
            <button className={`view-tab ${sunShow?'active':''}`} onClick={()=>setSunShow(v=>!v)}>☀ Sun</button>
          </>}
        </div>
      </div>

      <div className="massing-body">
        {/* Variant list */}
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
              {/* Mini thumbnail — stacked bottom to top */}
              <div className="variant-mini">
                {v.sectionProfile.map((b,bi)=>{
                  const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
                  return <div key={bi} style={{flex:b.floors,background:col.fill,borderTop:`1px solid ${col.stroke}`,minHeight:3}}/>
                })}
              </div>
            </div>
          ))}

          {/* 3D shape controls (only in 3D mode) */}
          {mode==='3d' && (
            <div style={{marginTop:10}}>
              <div className="section-head"><span className="section-label">3D shape</span><div className="section-line"/></div>
              {['box','taper','step','solar','podium'].map(s=>(
                <button key={s} className={`variant-card ${massingShape===s?'active':''}`} style={{display:'block',width:'100%',textAlign:'left',marginBottom:4,padding:'6px 10px'}} onClick={()=>setMassingShape(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
              {massingShape==='taper'&&<div className="slider-row" style={{marginTop:6}}><span className="slider-label">Top %</span><input type="range" min="10" max="100" value={Math.round(taperPct*100)} onChange={e=>setTaperPct(e.target.value/100)}/><span className="slider-val">{Math.round(taperPct*100)}%</span></div>}
              {massingShape==='step'&&<div className="slider-row" style={{marginTop:6}}><span className="slider-label">Steps</span><input type="range" min="2" max="6" step="1" value={stepCount} onChange={e=>setStepCount(+e.target.value)}/><span className="slider-val">{stepCount}</span></div>}
              {mode==='3d'&&sunShow&&<div style={{marginTop:8}}>
                <div className="slider-row"><span className="slider-label">Hour</span><input type="range" min="6" max="20" value={sunHour} onChange={e=>setSunHour(+e.target.value)}/><span className="slider-val">{sunHour}:00</span></div>
                <div className="slider-row"><span className="slider-label">Month</span><input type="range" min="1" max="12" value={sunMonth} onChange={e=>setSunMonth(+e.target.value)}/><span className="slider-val">{MONTHS[sunMonth-1]}</span></div>
              </div>}
            </div>
          )}
        </div>

        {/* Diagram / 3D area */}
        <div className="diagram-area">
          {mode==='2d' ? (<>
            {(view2d==='section'||view2d==='both')&&(
              <div className={`canvas-wrap ${view2d==='both'?'half':''}`}>
                <div className="canvas-label">SECTION — ground at bottom, roof at top</div>
                <canvas ref={sectionRef} className="diagram-canvas"/>
              </div>
            )}
            {(view2d==='plan'||view2d==='both')&&(
              <div className={`canvas-wrap ${view2d==='both'?'half':''}`}>
                <div className="canvas-label">TYPICAL FLOOR PLAN</div>
                <canvas ref={planRef} className="diagram-canvas"/>
              </div>
            )}
          </>) : (
            <div style={{flex:1,position:'relative'}}>
              <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block'}}/>
              <NorthArrow orientation={state.orientation||'N'}/>
              <div style={{position:'absolute',bottom:10,left:12,background:'rgba(237,243,248,0.88)',border:'1px solid var(--border)',borderRadius:5,padding:'4px 10px',fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-mid)',display:'flex',gap:8,backdropFilter:'blur(4px)'}}>
                <span>{state.projectName||'Study'}</span>
                <span style={{color:'var(--ink-ghost)'}}>|</span>
                <span>{programs.length} programs</span>
                <span style={{color:'var(--ink-ghost)'}}>|</span>
                <span style={{color:+farUsed>state.farMax?'var(--red)':'var(--accent)'}}>FAR {farUsed}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="massing-sidebar">
          <div className="card-white" style={{marginBottom:10}}>
            <div className="section-label" style={{marginBottom:8}}>Constraints</div>
            {[
              {l:'GFA',    v:`${totalSF.toLocaleString()} / ${Math.round(maxGFA).toLocaleString()} sf`, ok:totalSF<=maxGFA},
              {l:'FAR',    v:`${farUsed} / ${state.farMax}`,  ok:+farUsed<=state.farMax},
              {l:'Height', v:`${maxFloors*14} / ${state.heightMax} ft`, ok:maxFloors*14<=state.heightMax},
              {l:'Envelope',v:`${envW}×${envD} ft`, ok:true},
            ].map(m=>(
              <div key={m.l} style={{display:'flex',justifyContent:'space-between',marginBottom:5,alignItems:'baseline'}}>
                <span style={{fontSize:11,color:'var(--ink-mid)'}}>{m.l}</span>
                <div style={{display:'flex',gap:5}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:m.ok?'var(--accent)':'var(--red)'}}>{m.v}</span>
                  <span style={{fontSize:10}}>{m.ok?'✓':'⚠'}</span>
                </div>
              </div>
            ))}
          </div>

          {mode==='2d'&&selectedVariant&&(
            <div className="card-white" style={{marginBottom:10}}>
              <div className="section-label" style={{marginBottom:8}}>Programme legend</div>
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
          )}

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
              <div className="section-label" style={{marginBottom:5}}>Selected variant</div>
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
