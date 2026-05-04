import React, { useState } from 'react'
import Step1Setup from './components/Step1Setup.jsx'
import Step2Program from './components/Step2Program.jsx'
import Step3Massing from './components/Step3Massing.jsx'
import Step4Solar from './components/Step4Solar.jsx'
import Step5Facade from './components/Step5Facade.jsx'
import Step6Export from './components/Step6Export.jsx'
import './App.css'

const STEPS = [
  { n:1, label:'Site Setup' },
  { n:2, label:'Program' },
  { n:3, label:'Massing' },
  { n:4, label:'Solar & ESG' },
  { n:5, label:'Facade' },
  { n:6, label:'Export' },
]

const defaultState = {
  projectName:'Commercial Tower Study',
  lotW:120, lotD:160, lotArea:19200,
  farMax:8.0, heightMax:180, frontSB:15, sideSB:10, rearSB:20,
  orientation:'N', uploadedFile:null, aiExtracted:false,
  selectedPrograms:[],
  circulationType:'double-loaded', elevatorConfig:'e4', stairConfig:'s2',
  massingType:'box', taperPct:0.6, stepCount:3,
  sunHour:12, sunMonth:6,
  glassRatioN:0.30, glassRatioS:0.55, glassRatioE:0.45, glassRatioW:0.35,
  windowHeight:7, windowWidth:5, windowSpacing:3,
}

export default function App() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState(defaultState)
  const update = (patch) => setState(s => ({ ...s, ...patch }))

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-name">Jade</span>
            <span className="logo-sep">/</span>
            <span className="logo-product">MassForm</span>
          </div>
          <div className="header-tagline">Commercial Massing Engine</div>
        </div>
        <nav className="step-nav">
          {STEPS.map(s => (
            <button key={s.n}
              className={`step-btn ${step===s.n?'active':''} ${step>s.n?'done':''}`}
              onClick={() => step > s.n ? setStep(s.n) : null}>
              <span className="step-num">{step > s.n ? '✓' : s.n}</span>
              <span className="step-lbl">{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="header-right">
          <span className="tag gold">PROTOTYPE v0.1</span>
        </div>
      </header>
      <main className="app-main">
        {step===1 && <Step1Setup state={state} update={update} onNext={()=>setStep(2)} />}
        {step===2 && <Step2Program state={state} update={update} onNext={()=>setStep(3)} onBack={()=>setStep(1)} />}
        {step===3 && <Step3Massing state={state} update={update} onNext={()=>setStep(4)} onBack={()=>setStep(2)} />}
        {step===4 && <Step4Solar state={state} update={update} onNext={()=>setStep(5)} onBack={()=>setStep(3)} />}
        {step===5 && <Step5Facade state={state} update={update} onNext={()=>setStep(6)} onBack={()=>setStep(4)} />}
        {step===6 && <Step6Export state={state} update={update} onBack={()=>setStep(5)} />}
      </main>
    </div>
  )
}
