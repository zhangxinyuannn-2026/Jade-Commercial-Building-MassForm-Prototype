import React, { useRef, useEffect, useState } from 'react'
import './Step6Export.css'

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

const VARIANT_LIBRARY = {
  box:[
    { name:'Central Core', ref:'Seagram Building — Mies van der Rohe',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.82,colorKey:'office'},{xPct:0.1,wPct:0.8,label:'Mechanical / MEP',floors:0.08,colorKey:'mech'}] },
    { name:'Podium + Shaft', ref:'30 Hudson Yards — KPF',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.08,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Amenity Podium',floors:0.14,colorKey:'amenity'},{xPct:0.15,wPct:0.7,label:'Office Shaft',floors:0.70,colorKey:'office'},{xPct:0.25,wPct:0.5,label:'Crown / Plant',floors:0.08,colorKey:'rooftop'}] },
    { name:'Dual-Band', ref:'The Shard — Renzo Piano',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Trading/Finance',floors:0.20,colorKey:'highlight'},{xPct:0,wPct:1.0,label:'Office',floors:0.50,colorKey:'office'},{xPct:0.1,wPct:0.8,label:'Mechanical',floors:0.08,colorKey:'mech'},{xPct:0.3,wPct:0.4,label:'Crown / Plant',floors:0.12,colorKey:'rooftop'}] },
    { name:'End Core', ref:'Lever House — SOM',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.82,colorKey:'office'},{xPct:0.1,wPct:0.8,label:'Plant / MEP',floors:0.08,colorKey:'mech'}] },
  ],
  taper:[
    { name:'Classic Taper', ref:'Empire State / Chrysler — Art Deco',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.12,colorKey:'retail'},{xPct:0,wPct:0.95,label:'Office',floors:0.30,colorKey:'office'},{xPct:0.06,wPct:0.88,label:'Office',floors:0.24,colorKey:'office2'},{xPct:0.14,wPct:0.72,label:'Office',floors:0.20,colorKey:'office'},{xPct:0.28,wPct:0.44,label:'Amenity / Sky',floors:0.09,colorKey:'amenity'},{xPct:0.38,wPct:0.24,label:'Crown',floors:0.05,colorKey:'rooftop'}] },
    { name:'Pixelated Taper', ref:'MVRDV / BIG — pixel tower',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Retail / Lobby',floors:0.10,colorKey:'retail'},{xPct:0,wPct:0.90,label:'Office',floors:0.22,colorKey:'office'},{xPct:0.05,wPct:0.80,label:'Office',floors:0.18,colorKey:'office2'},{xPct:0.12,wPct:0.65,label:'Amenity Terrace',floors:0.08,colorKey:'amenity'},{xPct:0.12,wPct:0.52,label:'Office',floors:0.24,colorKey:'office'},{xPct:0.24,wPct:0.30,label:'Sky Lounge',floors:0.10,colorKey:'rooftop'},{xPct:0.32,wPct:0.16,label:'Crown / Spire',floors:0.08,colorKey:'mech'}] },
    { name:'Chamfered Tower', ref:'122 Leadenhall — Rogers Stirk Harbour',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.42,colorKey:'office'},{xPct:0.06,wPct:0.94,label:'Office',floors:0.22,colorKey:'office2'},{xPct:0.16,wPct:0.78,label:'Office + Amen.',floors:0.18,colorKey:'amenity'},{xPct:0.36,wPct:0.50,label:'Crown',floors:0.08,colorKey:'rooftop'}] },
    { name:'Inverted Taper', ref:'CCTV HQ — OMA',
      sectionProfile:[{xPct:0.22,wPct:0.56,label:'Lobby / Entry',floors:0.10,colorKey:'retail'},{xPct:0.14,wPct:0.72,label:'Office',floors:0.28,colorKey:'office'},{xPct:0.06,wPct:0.88,label:'Office',floors:0.30,colorKey:'office2'},{xPct:0,wPct:1.0,label:'Amenity / Sky',floors:0.20,colorKey:'amenity'},{xPct:0,wPct:1.0,label:'Crown Garden',floors:0.12,colorKey:'rooftop'}] },
  ],
  stepped:[
    { name:'Skyline Steps', ref:'Rockefeller Center — Harrison & Abramovitz',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Retail / Lobby',floors:0.12,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Lower Office',floors:0.20,colorKey:'office'},{xPct:0,wPct:1.0,label:'Sky Terrace 1',floors:0.05,colorKey:'amenity'},{xPct:0.12,wPct:0.76,label:'Mid Office',floors:0.26,colorKey:'office2'},{xPct:0.12,wPct:0.76,label:'Sky Terrace 2',floors:0.05,colorKey:'amenity'},{xPct:0.26,wPct:0.48,label:'Upper Office',floors:0.20,colorKey:'office'},{xPct:0.36,wPct:0.28,label:'Crown / Plant',floors:0.12,colorKey:'rooftop'}] },
    { name:'Cascading Terraces', ref:'One Angel Square — BDP',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Ground Activation',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office Band 1',floors:0.18,colorKey:'office'},{xPct:0.08,wPct:0.84,label:'Office Band 2',floors:0.18,colorKey:'office2'},{xPct:0.18,wPct:0.68,label:'Terrace + Office',floors:0.22,colorKey:'office'},{xPct:0.30,wPct:0.52,label:'Amenity Floor',floors:0.10,colorKey:'amenity'},{xPct:0.30,wPct:0.40,label:'Upper Office',floors:0.22,colorKey:'office2'}] },
    { name:'Pixelated Stack', ref:'VIA 57 West — BIG',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Parking / Lobby',floors:0.10,colorKey:'mech'},{xPct:0,wPct:0.90,label:'Co-Working',floors:0.12,colorKey:'highlight'},{xPct:0,wPct:0.76,label:'Office',floors:0.22,colorKey:'office'},{xPct:0.10,wPct:0.64,label:'Amenity Sky',floors:0.08,colorKey:'amenity'},{xPct:0.22,wPct:0.54,label:'Office Tower',floors:0.28,colorKey:'office2'},{xPct:0.32,wPct:0.34,label:'Rooftop Lounge',floors:0.20,colorKey:'rooftop'}] },
  ],
  courtyard:[
    { name:'Central Atrium', ref:"Lloyd's of London — Richard Rogers",
      sectionProfile:[{xPct:0,wPct:0.30,label:'Office Wing W',floors:1.0,colorKey:'office'},{xPct:0.35,wPct:0.30,label:'Atrium Void',floors:1.0,colorKey:'void'},{xPct:0.70,wPct:0.30,label:'Office Wing E',floors:1.0,colorKey:'office2'}] },
    { name:'Sky Garden Core', ref:'The Gherkin — Foster + Partners',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Lobby / Retail',floors:0.10,colorKey:'retail'},{xPct:0,wPct:1.0,label:'Office',floors:0.18,colorKey:'office'},{xPct:0.05,wPct:0.90,label:'Sky Garden 1',floors:0.06,colorKey:'amenity'},{xPct:0,wPct:1.0,label:'Office',floors:0.20,colorKey:'office2'},{xPct:0.05,wPct:0.90,label:'Sky Garden 2',floors:0.06,colorKey:'amenity'},{xPct:0,wPct:1.0,label:'Office',floors:0.24,colorKey:'office'},{xPct:0.20,wPct:0.60,label:'Crown Terrace',floors:0.16,colorKey:'rooftop'}] },
    { name:'Split Courtyard', ref:'Tencent HQ — NBBJ',
      sectionProfile:[{xPct:0,wPct:0.42,label:'Tower A',floors:1.0,colorKey:'office'},{xPct:0.44,wPct:0.14,label:'Courtyard',floors:0.30,colorKey:'void'},{xPct:0.44,wPct:0.14,label:'Sky Bridge',floors:0.15,colorKey:'amenity'},{xPct:0.60,wPct:0.40,label:'Tower B',floors:0.88,colorKey:'office2'}] },
  ],
  cluster:[
    { name:'Podium + Twin Towers', ref:'One & Two WTC — podium base',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Shared Podium',floors:0.12,colorKey:'retail'},{xPct:0,wPct:0.42,label:'Tower A',floors:0.78,colorKey:'office'},{xPct:0.58,wPct:0.42,label:'Tower B (tall)',floors:0.98,colorKey:'office2'},{xPct:0.16,wPct:0.66,label:'Sky Bridge',floors:0.05,colorKey:'amenity'}] },
    { name:'Asymmetric Cluster', ref:'Tour Carpe Diem — Morphosis',
      sectionProfile:[{xPct:0,wPct:1.0,label:'Ground Podium',floors:0.10,colorKey:'amenity'},{xPct:0,wPct:0.32,label:'Low-rise Vol.',floors:0.28,colorKey:'retail'},{xPct:0.34,wPct:0.30,label:'Mid Tower',floors:0.58,colorKey:'office2'},{xPct:0.66,wPct:0.34,label:'Main Tower',floors:0.92,colorKey:'office'}] },
    { name:'Linked Volumes', ref:'Bloomberg HQ London — Foster + Partners',
      sectionProfile:[{xPct:0,wPct:0.44,label:'Slab A',floors:0.92,colorKey:'office'},{xPct:0.44,wPct:0.12,label:'Void / Bridge',floors:0.35,colorKey:'void'},{xPct:0.56,wPct:0.44,label:'Slab B',floors:1.0,colorKey:'office2'},{xPct:0.16,wPct:0.68,label:'Connecting Bridge',floors:0.08,colorKey:'highlight'}] },
  ],
}

// ── SECTION DRAW — Y-FLIP so ground is at bottom ─────────────────────────────
function drawExportSection(canvas, variant) {
  if (!canvas || !variant) return
  const dpr = window.devicePixelRatio || 2
  const W = canvas.offsetWidth || 520
  const H = canvas.offsetHeight || 280
  canvas.width  = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const PL=52, PR=14, PT=36, PB=44
  const dW=W-PL-PR, dH=H-PT-PB

  // Flip Y: translate origin to bottom-left of drawing area, Y increases upward
  ctx.save()
  ctx.translate(PL, PT+dH)
  ctx.scale(1, -1)

  const profile  = variant.sectionProfile  // GROUND→ROOF order
  const totalPct = profile.reduce((s,b)=>s+b.floors, 0)
  const isParallel = ['dual-core','perimeter-core','triple-core'].includes(variant.planType)

  if (isParallel) {
    profile.forEach(band => {
      drawExportBand(ctx, band.xPct*dW, 0, band.wPct*dW, (band.floors/1.0)*dH, band)
    })
  } else {
    let y = 0
    profile.forEach(band => {
      const bH = (band.floors/totalPct)*dH
      drawExportBand(ctx, band.xPct*dW, y, band.wPct*dW, bH, band)
      y += bH
    })
  }

  ctx.restore()

  // Ground line
  ctx.fillStyle='#7aaa82'; ctx.fillRect(PL-10, PT+dH, dW+20, 3)
  ctx.strokeStyle='rgba(80,120,80,0.15)'; ctx.lineWidth=0.7
  for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(PL-10,PT+dH+3+i*4);ctx.lineTo(PL+dW+10,PT+dH+3+i*4);ctx.stroke()}

  // Height dim
  ctx.strokeStyle='#4a7055';ctx.lineWidth=0.8;ctx.setLineDash([2,3])
  ctx.beginPath();ctx.moveTo(PL-22,PT);ctx.lineTo(PL-22,PT+dH);ctx.stroke();ctx.setLineDash([])
  ctx.save();ctx.fillStyle='#2d6a4f';ctx.font='9px DM Mono,monospace';ctx.textAlign='center'
  ctx.translate(PL-34,PT+dH/2);ctx.rotate(-Math.PI/2)
  ctx.fillText(`${variant.maxFloors||20}F / ${(variant.maxFloors||20)*14}ft`,0,0);ctx.restore()

  // Width dim
  ctx.strokeStyle='#4a7055';ctx.lineWidth=0.8;ctx.setLineDash([2,3])
  ctx.beginPath();ctx.moveTo(PL,PT+dH+18);ctx.lineTo(PL+dW,PT+dH+18);ctx.stroke();ctx.setLineDash([])
  ctx.fillStyle='#2d6a4f';ctx.font='9px DM Mono,monospace';ctx.textAlign='center'
  ctx.fillText(`${variant.envW||100} ft`,PL+dW/2,PT+dH+32)

  // Title
  ctx.fillStyle='#1c2e20';ctx.font='bold 11px DM Mono,monospace';ctx.textAlign='left'
  ctx.fillText(variant.name||'',PL,PT-18)
  ctx.fillStyle='#7a9e85';ctx.font='9px DM Mono,monospace'
  ctx.fillText(variant.ref||'',PL,PT-8)
}

function drawExportBand(ctx, bx, by, bw, bH, band) {
  if (bH<1||bw<1) return
  const col = COLOR_MAP[band.colorKey]||COLOR_MAP.office
  if (band.colorKey==='void') {
    ctx.save();ctx.beginPath();ctx.rect(bx,by,bw,bH);ctx.clip()
    ctx.fillStyle='rgba(200,218,232,0.22)';ctx.fillRect(bx,by,bw,bH)
    ctx.strokeStyle='rgba(90,130,155,0.2)';ctx.lineWidth=0.7;ctx.setLineDash([4,4])
    for(let d=-bH;d<bw+bH;d+=8){ctx.beginPath();ctx.moveTo(bx+d,by);ctx.lineTo(bx+d+bH,by+bH);ctx.stroke()}
    ctx.setLineDash([]);ctx.restore()
  } else {
    ctx.fillStyle=col.fill;ctx.fillRect(bx,by,bw,bH)
  }
  ctx.strokeStyle=col.stroke;ctx.lineWidth=1;ctx.strokeRect(bx+0.5,by+0.5,bw-1,bH-1)
  if (!['void','mech','core'].includes(band.colorKey)&&bH>16){
    const fCount=Math.max(2,Math.round(band.floors*3))
    ctx.strokeStyle=col.stroke+'44';ctx.lineWidth=0.4
    for(let f=1;f<fCount;f++){ctx.beginPath();ctx.moveTo(bx+2,by+(f/fCount)*bH);ctx.lineTo(bx+bw-2,by+(f/fCount)*bH);ctx.stroke()}
  }
  if (bH>14) {
    ctx.save();ctx.translate(bx+bw/2,by+bH/2);ctx.scale(1,-1)
    ctx.fillStyle=col.text
    const fs=Math.min(10,Math.max(7,Math.min(bH,bw)*0.14))
    ctx.font=`500 ${fs}px DM Mono,monospace`;ctx.textAlign='center'
    let label=band.label
    while(ctx.measureText(label).width>bw-8&&label.length>4) label=label.slice(0,-2)+'…'
    ctx.fillText(label,0,fs*0.35);ctx.restore()
  }
}

// ── ANALYTICAL NARRATIVE ──────────────────────────────────────────────────────
function generateNarrative(state, programs, totalSF, farUsed, floors, facadeArea) {
  const massingType  = state.massingType||'box'
  const orientation  = state.orientation||'N'
  const glassType    = state.glassType||'highPerf'
  const facadeCost   = state.facadeCostTotal||0
  const annualSaving = state.annualEnergySaving||0
  const farMax       = state.farMax||8
  const farPct       = Math.round(+farUsed / farMax * 100)
  const facing       = {N:'north',NE:'north-east',E:'east',SE:'south-east',S:'south',SW:'south-west',W:'west',NW:'north-west'}[orientation]||'south'
  const glassLabel   = {standard:'standard double-glazed IGU',highPerf:'high-performance low-e glazing',triple:'triple-glazed units',electrochromic:'electrochromic smart glass'}[glassType]||'high-performance glazing'
  const esgFacing    = {N:'C',NE:'B',E:'B+',SE:'A',S:'A+',SW:'A',W:'B',NW:'B-'}[orientation]||'B'
  const isGoodOrientation = ['SE','S','SW'].includes(orientation)
  const isBadOrientation  = ['N','NW','W'].includes(orientation)
  const isHighFAR    = farPct > 85
  const isLowFAR     = farPct < 50
  const isGoodGlass  = ['highPerf','triple','electrochromic'].includes(glassType)
  const hasAmenity   = programs.some(p=>['rooftop-lounge','gym','wellness','cafe','rooftop_lounge','amenity'].includes(p.id||p.category))
  const officePct    = totalSF>0 ? Math.round(programs.filter(p=>p.category==='workspace'||['open-office','flex-workspace','hybrid-workspace'].includes(p.id)).reduce((s,p)=>s+(p.sf||0),0)/totalSF*100) : 0

  const strengths=[], risks=[], suggestions=[]

  if (isHighFAR) {
    strengths.push(`FAR utilisation is at ${farPct}% of the zoning allowance — the programme makes strong use of permitted density. This maximises land value and rental yield, which is the correct approach for a commercial development at this scale.`)
  } else if (isLowFAR) {
    risks.push(`FAR utilisation is only ${farPct}% of the permitted maximum. The building is leaving significant floor area — and therefore revenue — unrealised. At the current lot size, approximately ${Math.round((farMax*0.8 - +farUsed)*(state.lotW||120)*(state.lotD||160)).toLocaleString()} additional square feet could be added before reaching 80% of the FAR limit.`)
    suggestions.push(`To reach 80%+ FAR utilisation without exceeding height limits, consider adding a mid-level amenity floor, expanding office programme on the upper levels, or introducing a rooftop terrace level. Each of these increases GFA while adding marketable value rather than just bulk.`)
  } else {
    strengths.push(`FAR utilisation at ${farPct}% represents a healthy balance between density and buildability. The building captures most of the zoning allowance without approaching compliance risk or structural complexity.`)
  }

  if (isGoodOrientation) {
    strengths.push(`The ${facing}-facing primary orientation is among the strongest choices for this climate. South and south-east facades capture maximum winter solar gain while allowing horizontal overhangs to manage summer overheating. This reduces annual HVAC demand by an estimated 20–32% compared to a north-facing equivalent — one of the highest-leverage design decisions available at this stage.`)
  } else if (isBadOrientation) {
    risks.push(`A ${facing}-facing primary facade is a difficult orientation to work with. North and west faces receive low-quality afternoon sun in summer and minimal useful solar gain in winter, which simultaneously drives up artificial lighting loads and cooling costs. Without compensating measures, this will suppress the building's ESG rating and increase operating costs for tenants.`)
    suggestions.push(`If the site prevents rotation towards south or south-east, introduce a deep-reveal facade system on the ${facing} face (minimum 500mm reveals) and increase glazing ratios on the south and east sides of the plan. A perimeter-core or atrium typology would also help by ensuring all office zones have access to a south or east-facing aspect regardless of the primary street orientation.`)
  }

  if (isGoodGlass) {
    strengths.push(`The choice of ${glassLabel} is well-suited to this scale and programme. With U-values significantly below the ASHRAE 90.1 baseline, the estimated annual energy saving of $${(annualSaving/1000).toFixed(0)}K is commercially meaningful. At a $${(facadeCost/1e6).toFixed(1)}M facade investment, the upgrade specification pays back within a commercially viable timeframe and strengthens the LEED case.`)
  } else {
    risks.push(`Standard IGU glazing at this scale will result in HVAC loads well above what high-performance alternatives would achieve. With ${facadeArea.toLocaleString()} sf of facade area, even a modest improvement in U-value across the south and west faces would yield tens of thousands of dollars in annual operational savings — savings that directly benefit tenants and support higher lease rates.`)
    suggestions.push(`Upgrade the south and west facades to high-performance low-e glazing as a minimum. The marginal installed cost over standard IGU is typically $25–30/sf. At the glazing areas involved, this represents an additional capital cost of approximately $${Math.round(facadeArea*0.5*27/1000).toFixed(0)}K — recoverable through energy savings within 8–12 years, and a material factor in achieving Silver or Gold LEED certification.`)
  }

  const massingAdvice = {
    box:{ str:'The box/slab typology is the most commercially efficient form — it maximises rentable area per floor and minimises facade cost per square foot of GFA. It is the benchmark against which all other strategies are measured, and the right choice where development economics are the primary driver.',
          risk:'Without articulation at street level or a distinctive crown, a pure box risks reading as generic commercial stock — a real concern for premium letting. Consider a double-height lobby, a set-back plant level expressed as a lantern, or differentiated cladding on the upper 15% to create identity without sacrificing floor area.' },
    taper:{ str:'The tapering form reduces the floor plate at upper levels, creating more corner units with better views — a strong selling point for premium office and hospitality floors. The wider base at ground level also supports more substantial retail or lobby activation.',
            risk:'Tapering reduces total floor area achievable compared to a straight extrusion at the same FAR. Verify that the area schedule at the narrowed upper floors still meets programme requirements, and that the structural transfer at each taper point is budgeted — typically an additional $15–20/sf on those levels.' },
    stepped:{ str:'Stepped massing with sky terraces is increasingly demanded by commercial tenants as a wellbeing differentiator, and creates a distinctive skyline profile that supports premium rents on terrace-adjacent floors. Done well, the stepped form is also one of the easiest strategies to justify to planning authorities.',
              risk:'Structural transfer slabs at each setback add construction cost and programme risk. Budget for $15–25/sf additional structural cost at each step, and ensure the terrace areas are sized to be genuinely usable rather than token gestures — a minimum 300sf terrace is typically the threshold for effective tenant use.' },
    courtyard:{ str:'The courtyard or atrium typology is among the highest performers for daylight — all offices face the central void, eliminating deep-plan conditions and reducing artificial lighting loads significantly. Sky gardens and atria also score strongly in LEED, WELL, and BREEAM assessments, which increasingly influence institutional tenant decisions.',
                risk:'The void reduces rentable area compared to a solid extrusion at the same FAR. Ensure the atrium is sized for genuine daylight benefit — a minimum width-to-height ratio of 1:3 is required for effective daylighting at lower floors. Narrower atria become ventilation shafts rather than amenity.' },
    cluster:{ str:'A clustered or split-tower arrangement creates strong visual identity and allows different programme components to be expressed as distinct volumes — a significant advantage for mixed-use schemes where retail, office, and amenity tenants benefit from separate street-level addresses.',
              risk:'Multiple cores and podium structure add construction complexity and cost. Sky bridge connections are expensive — budget $2–4M per bridge depending on span — and must be designed as genuine amenity or collaborative space to justify the cost premium. If they are treated as pure circulation, the economics rarely stack up.' },
  }
  const advice = massingAdvice[massingType]||massingAdvice.box
  if (advice.str) strengths.push(advice.str)
  if (advice.risk) risks.push(advice.risk)

  if (hasAmenity) {
    strengths.push(`The inclusion of amenity programme (gym, wellness, café, rooftop lounge, or similar) directly addresses the post-pandemic expectation that office buildings provide reasons to come in. Gensler's 2024 Workplace Survey found buildings with on-site wellness amenities command a 12–18% asking rent premium over comparable stock without them — making this one of the highest-return investments in the programme mix.`)
  } else {
    suggestions.push(`Consider adding at least one dedicated amenity floor at 3–5% of total GFA. A gym, café-lounge, or accessible rooftop terrace is now a standard expectation among institutional office tenants and has measurable impact on lease-up speed and achievable rent. At the programme scale of this study, even 1,500–3,000 sf of genuine amenity space would shift the building into a different letting tier.`)
  }

  const score = [isGoodOrientation, (isHighFAR||(!isLowFAR)), isGoodGlass, hasAmenity].filter(Boolean).length
  const rating = score>=4 ? 'Strong' : score>=3 ? 'Solid' : score>=2 ? 'Moderate' : 'Needs attention'

  return { strengths, risks, suggestions, rating, esgFacing, score, farPct, officePct }
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function SummaryCard({label,value,sub}){
  return(
    <div className="ex-summary-card">
      <div className="ex-summary-label">{label}</div>
      <div className="ex-summary-val">{value}</div>
      {sub&&<div className="ex-summary-sub">{sub}</div>}
    </div>
  )
}

function ProgramBar({prog, totalSF}){
  const pct = Math.round((prog.sf||prog.defaultSF||0)/Math.max(totalSF,1)*100)
  return(
    <div className="ex-prog-bar">
      <div className="ex-prog-color" style={{background:prog.color}}/>
      <span className="ex-prog-name">{prog.label}</span>
      <span className="ex-prog-sf">{(prog.sf||prog.defaultSF||0).toLocaleString()} sf</span>
      <span className="ex-prog-h">{prog.floorH||14}ft</span>
      <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--ink-ghost)',minWidth:28,textAlign:'right'}}>{pct}%</span>
    </div>
  )
}

// ── MAIN EXPORT COMPONENT ─────────────────────────────────────────────────────
export default function Step6Export({state, onBack}){
  const canvasRef = useRef(null)
  const [printing, setPrinting] = useState(false)

  const programs  = state.selectedPrograms||[]
  const totalSF   = programs.reduce((s,p)=>s+(p.sf||p.defaultSF||0),0)||1
  const maxGFA    = (state.lotW||120)*(state.lotD||160)*(state.farMax||8)
  const envW      = (state.lotW||120)-(state.sideSB||10)*2
  const envD      = (state.lotD||160)-(state.frontSB||15)-(state.rearSB||20)
  const floors    = Math.max(1,Math.round(totalSF/(envW*envD)))
  const maxFloors = Math.max(4,Math.round((state.heightMax||180)/14))
  const farUsed   = (totalSF/((state.lotW||120)*(state.lotD||160))).toFixed(2)
  const perimFt   = 2*(envW+envD)
  const facadeArea= perimFt*floors*14
  const today     = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})

  const massingType     = state.massingType||'box'
  const variantName     = state.selectedMassingVariant
  const variants        = VARIANT_LIBRARY[massingType]||[]
  const selectedVariant = variants.find(v=>v.name===variantName)||variants[0]
  const enrichedVariant = selectedVariant ? {...selectedVariant, envW, envD, maxFloors} : null

  const narrative = generateNarrative(state, programs, totalSF, farUsed, floors, facadeArea)

  useEffect(()=>{
    if (!enrichedVariant||!canvasRef.current) return
    const t = setTimeout(()=>drawExportSection(canvasRef.current, enrichedVariant), 80)
    return ()=>clearTimeout(t)
  },[enrichedVariant])

  return(
    <div className="step-wrap" style={{maxWidth:860}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
        <h1 className="step-title">Export <em>study.</em></h1>
        <span className="tag">Step 06</span>
      </div>
      <p className="step-sub">A complete massing study report with section diagram, programme schedule, and performance analysis. Print to save as PDF.</p>

      <div className="ex-actions">
        <button className="btn-primary" onClick={()=>{setPrinting(true);setTimeout(()=>{window.print();setPrinting(false)},100)}} disabled={printing} style={{display:'flex',alignItems:'center',gap:8}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          {printing?'Preparing…':'Print / Save PDF'}
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back to Solar & ESG</button>
      </div>

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

        {/* Rating banner */}
        <div className={`ex-rating-banner rating-${narrative.rating.toLowerCase().replace(/ /g,'-')}`}>
          <div className="ex-rating-label">Overall study rating</div>
          <div className="ex-rating-val">{narrative.rating}</div>
          <div className="ex-rating-sub">{narrative.score} of 4 performance criteria met · ESG orientation {narrative.esgFacing} · FAR {narrative.farPct}% utilised</div>
        </div>

        {/* Section diagram */}
        {enrichedVariant&&(
          <>
            <div className="ex-section-title">01 — Massing section</div>
            <canvas ref={canvasRef} style={{width:'100%',height:260,border:'1px solid var(--border)',borderRadius:6,display:'block',marginBottom:6}}/>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
              {[...new Map(enrichedVariant.sectionProfile.map(b=>[b.colorKey,b])).values()].map(b=>{
                const col=COLOR_MAP[b.colorKey]||COLOR_MAP.office
                return(
                  <div key={b.colorKey} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'var(--ink-mid)'}}>
                    <div style={{width:11,height:8,background:col.fill,border:`1px solid ${col.stroke}`,borderRadius:2}}/>
                    {b.label}
                  </div>
                )
              })}
            </div>
            <div style={{fontSize:10,color:'var(--ink-dim)',fontStyle:'italic',marginBottom:4}}>{enrichedVariant.ref}</div>
            <div className="ex-divider"/>
          </>
        )}

        {/* Site + massing parameters */}
        <div className="ex-section-title">02 — Site & massing parameters</div>
        <div className="ex-grid-4" style={{marginBottom:4}}>
          <SummaryCard label="Lot" value={`${state.lotW||120}×${state.lotD||160} ft`} sub={`${((state.lotW||120)*(state.lotD||160)).toLocaleString()} sf`}/>
          <SummaryCard label="Max FAR" value={state.farMax||8} sub={`Used: ${farUsed} (${narrative.farPct}%)`}/>
          <SummaryCard label="Height" value={`${maxFloors*14} ft`} sub={`${maxFloors}F / limit ${state.heightMax}ft`}/>
          <SummaryCard label="Envelope" value={`${envW}×${envD} ft`} sub="After setbacks"/>
          <SummaryCard label="Massing" value={massingType.charAt(0).toUpperCase()+massingType.slice(1)} sub={enrichedVariant?.name||'—'}/>
          <SummaryCard label="Orientation" value={state.orientation||'N'} sub={`ESG: ${narrative.esgFacing}`}/>
          <SummaryCard label="Glazing" value={`${Math.round(((state.glassRatioS||0.55)+(state.glassRatioN||0.30)+(state.glassRatioE||0.45)+(state.glassRatioW||0.35))/4*100)}% avg`} sub={state.glassType||'highPerf'}/>
          <SummaryCard label="Facade cost" value={`$${((state.facadeCostTotal||0)/1e6).toFixed(1)}M`} sub={`${facadeArea.toLocaleString()} sf`}/>
        </div>
        <div className="ex-divider"/>

        {/* Programme */}
        <div className="ex-section-title">03 — Programme schedule</div>
        {programs.length>0?(
          <>
            <div className="ex-prog-list">
              {programs.map(p=><ProgramBar key={p.id} prog={p} totalSF={totalSF}/>)}
            </div>
            <div className="ex-prog-total">
              <span>Total programme area</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600}}>{totalSF.toLocaleString()} sf</span>
            </div>
            <div className="ex-prog-chart">
              {programs.map(p=>{
                const pct=(p.sf||p.defaultSF||0)/totalSF*100
                return <div key={p.id} className="ex-chart-bar" style={{width:pct+'%',background:p.color,minWidth:2}}/>
              })}
            </div>
          </>
        ):(
          <p style={{fontSize:12,color:'var(--ink-ghost)',fontStyle:'italic',marginBottom:8}}>No programmes selected.</p>
        )}
        <div className="ex-divider"/>

        {/* Performance analysis */}
        <div className="ex-section-title">04 — Performance analysis & recommendations</div>
        {narrative.strengths.length>0&&(
          <div className="ex-narrative-block ex-strengths">
            <div className="ex-narrative-head"><span className="ex-narrative-icon">✓</span><span>Strengths</span></div>
            {narrative.strengths.map((s,i)=><p key={i} className="ex-narrative-p">{s}</p>)}
          </div>
        )}
        {narrative.risks.length>0&&(
          <div className="ex-narrative-block ex-risks">
            <div className="ex-narrative-head"><span className="ex-narrative-icon">⚠</span><span>Risks & considerations</span></div>
            {narrative.risks.map((r,i)=><p key={i} className="ex-narrative-p">{r}</p>)}
          </div>
        )}
        {narrative.suggestions.length>0&&(
          <div className="ex-narrative-block ex-suggestions">
            <div className="ex-narrative-head"><span className="ex-narrative-icon">→</span><span>Suggestions for next iteration</span></div>
            {narrative.suggestions.map((s,i)=><p key={i} className="ex-narrative-p">{s}</p>)}
          </div>
        )}
        <div className="ex-divider"/>

        {/* Cost summary */}
        <div className="ex-section-title">05 — Cost & energy summary</div>
        <div className="ex-grid-4" style={{marginBottom:8}}>
          <SummaryCard label="Facade cost" value={`$${((state.facadeCostTotal||0)/1e6).toFixed(2)}M`}/>
          <SummaryCard label="Annual energy" value={`$${((state.annualEnergyCost||Math.round(totalSF*4.5))/1000).toFixed(0)}K/yr`}/>
          <SummaryCard label="Annual saving" value={`–$${((state.annualEnergySaving||0)/1000).toFixed(0)}K/yr`} sub="vs standard IGU baseline"/>
          <SummaryCard label="LEED est." value={['A+','A'].includes(narrative.esgFacing)?'Gold / Platinum':'Silver / Certified'} sub="Subject to full assessment"/>
        </div>
        <div className="ex-divider"/>

        {/* Notes */}
        <div className="ex-section-title">06 — Design notes</div>
        <div className="ex-notes-area">
          <div className="ex-notes-placeholder">Client comments, next steps, open questions…</div>
          <div className="ex-notes-lines">{Array(5).fill(0).map((_,i)=><div key={i} className="ex-notes-line"/>)}</div>
        </div>
        <div className="ex-divider"/>

        <div className="ex-footer">
          <span>MassForm — Commercial Massing Engine by Jade</span>
          <span>massform.vercel.app</span>
          <span>Prototype v0.1 · {today}</span>
          <span>All figures are estimates. Verify with a licensed architect and cost consultant.</span>
        </div>
      </div>
    </div>
  )
}
