import React, { useState } from 'react'
import Step1Setup from './components/Step1Setup.jsx'
import Step2Program from './components/Step2Program.jsx'
import Step3Massing from './components/Step3Massing.jsx'
import Step4Solar from './components/Step4Solar.jsx'
import Step5Facade from './components/Step5Facade.jsx'
import './App.css'

const STEPS = [
  { n: 1, label: 'Site Setup' },
  { n: 2, label: 'Program' },
  { n: 3, label: 'Massing' },
  { n: 4, label: 'Solar & ESG' },
  { n: 5, label: 'Facade' },
]

const defaultState = {
  // Step 1
  projectName: 'Commercial Tower Study',
  lotW: 120, lotD: 160, lotArea: 19200,
  farMax: 8.0, heightMax: 180, frontSB: 15, sideSB: 10, rearSB: 20,
  orientation: 'N',
  uploadedFile: null, aiExtracted: false,
  // Step 2
  selectedPrograms: [],
  circulationType: 'double-loaded',
  elevatorConfig: 'e4',
  stairConfig: 's2',
  // Step 3
  massingType: 'box',
  taperPct: 0.6,
  stepCount: 3,
  programLayout: [], // [{programId, x, y, w, d, floor}]
  // Step 4
  sunHour: 12, sunMonth: 6,
  facingRecommendation: null,
  // Step 5
  glassRatioN: 0.30, glassRatioS: 0.60, glassRatioE: 0.45, glassRatioW: 0.45,
  windowHeight: 7, windowWidth: 5, windowSpacing: 3,
}

export default function App() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState(defaultState)

  const update = (patch) => setState(s => ({ ...s, ...patch }))
  const goTo = (n) => setStep(n)

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
            <button
              key={s.n}
              className={`step-btn ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}
              onClick={() => step > s.n ? goTo(s.n) : null}
            >
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
        {step === 1 && <Step1Setup state={state} update={update} onNext={() => goTo(2)} />}
        {step === 2 && <Step2Program state={state} update={update} onNext={() => goTo(3)} onBack={() => goTo(1)} />}
        {step === 3 && <Step3Massing state={state} update={update} onNext={() => goTo(4)} onBack={() => goTo(2)} />}
        {step === 4 && <Step4Solar state={state} update={update} onNext={() => goTo(5)} onBack={() => goTo(3)} />}
        {step === 5 && <Step5Facade state={state} update={update} onBack={() => goTo(4)} />}
      </main>
    </div>
  )
}
