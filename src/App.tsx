import { BattleCanvas } from './components/BattleCanvas'

export default function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0d0d1a',
    }}>
      <BattleCanvas />
    </div>
  )
}
