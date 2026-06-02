'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RetosPage() {
  const [retos, setRetos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reglas, setReglas] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const loadRetos = useCallback(async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('challenge_id, status, challenges(*)')
      .eq('user_id', uid)
      .eq('status', 'accepted')
    
    if (error) console.error('Error cargando retos:', error)
    setRetos(data?.map((d: any) => d.challenges).filter(Boolean) || [])
  }, [])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }
      
      setUserId(user.id)
      await loadRetos(user.id)
      setLoading(false)
    }
    init()
  }, [router, loadRetos])

  const crearReto = async () => {
    if (!nombre.trim() || !fechaInicio || !fechaFin) {
      setErrorMsg('Completa nombre, fecha inicio y fecha fin')
      return
    }
    if (!userId) {
      setErrorMsg('Error de sesión. Por favor recarga la página.')
      return
    }

    setSaving(true)
    setErrorMsg('')
    const supabase = createClient()

    const { data: reto, error: retoError } = await supabase
      .from('challenges')
      .insert({
        name: nombre.trim(),
        metric: 'calories',
        start_date: fechaInicio,
        end_date: fechaFin,
        rules: reglas.trim() || null,
        status: 'active',
        created_by: userId
      })
      .select()
      .single()

    if (retoError) {
      console.error('Error creando reto:', retoError)
      setErrorMsg('Error al crear el reto: ' + retoError.message)
      setSaving(false)
      return
    }

    const { error: partError } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: reto.id,
        user_id: userId,
        status: 'accepted'
      })

    if (partError) {
      console.error('Error agregando participante:', partError)
    }

    setRetos(prev => [...prev, reto])
    setShowForm(false)
    setNombre('')
    setFechaInicio('')
    setFechaFin('')
    setReglas('')
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff4d00', fontSize:'20px', fontWeight:700 }}>
      ⚡ Cargando...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'20px', maxWidth:'480px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'24px', fontWeight:900, color:'#ff4d00' }}>SPORT BRO'S</div>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>← Inicio</button>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5' }}>Mis Retos</div>
        <button onClick={() => { setShowForm(!showForm); setErrorMsg('') }}
          style={{ background:'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', color:'#fff', padding:'10px 18px', borderRadius:'10px', cursor:'pointer', fontWeight:700, fontSize:'14px' }}>
          {showForm ? 'Cancelar' : '+ Crear Reto'}
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:800, color:'#f0f0f5', marginBottom:'16px' }}>🏆 Nuevo Reto</div>

          <div style={{ marginBottom:'12px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>NOMBRE DEL RETO *</div>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Quema Junio 🔥"
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FECHA INICIO *</div>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FECHA FIN *</div>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom:'14px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>REGLAS</div>
            <textarea value={reglas} onChange={e => setReglas(e.target.value)} placeholder="Ej: Mínimo 30 min por sesión. Se requiere foto de evidencia."
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', minHeight:'80px', resize:'none', boxSizing:'border-box' }} />
          </div>

          {errorMsg && (
            <div style={{ background:'rgba(255,71,87,0.1)', border:'1px solid rgba(255,71,87,0.3)', borderRadius:'8px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#ff4757' }}>
              {errorMsg}
            </div>
          )}

          <button onClick={crearReto} disabled={saving}
            style={{ width:'100%', padding:'14px', background: saving ? '#333' : 'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:800, fontSize:'15px', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Creando...' : 'Crear Reto →'}
          </button>
        </div>
      )}

      {retos.length === 0 ? (
        <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏁</div>
          <div style={{ fontSize:'16px', fontWeight:700, color:'#f0f0f5', marginBottom:'8px' }}>No tienes retos aún</div>
          <div style={{ fontSize:'13px', color:'#5a5a72' }}>Crea tu primer reto y desafía a tus amigos</div>
        </div>
      ) : (
        retos.map((reto: any) => (
          <div key={reto.id} style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'18px', marginBottom:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
              <div style={{ fontSize:'17px', fontWeight:800, color:'#f0f0f5' }}>{reto.name}</div>
              <div style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'6px' }}>
                ACTIVO
              </div>
            </div>
            <div style={{ fontSize:'12px', color:'#5a5a72', marginBottom:'8px' }}>📅 {reto.start_date} → {reto.end_date}</div>
            {reto.rules && <div style={{ fontSize:'12px', color:'#5a5a72', lineHeight:'1.5' }}>📋 {reto.rules}</div>}
            <button onClick={() => router.push('/registrar')}
              style={{ marginTop:'14px', width:'100%', padding:'10px', background:'rgba(255,77,0,0.1)', border:'1px solid rgba(255,77,0,0.3)', borderRadius:'8px', color:'#ff4d00', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              🔥 Registrar sesión
            </button>
          </div>
        ))
      )}
    </div>
  )
}

