'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RetosPage() {
  const [retos, setRetos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reglas, setReglas] = useState('')
  const [invitado, setInvitado] = useState('')
  const [invitados, setInvitados] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('challenge_participants')
        .select('challenge_id, status, challenges(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      setRetos(data?.map((d: any) => d.challenges) || [])
      setLoading(false)
    }
    load()
  }, [])

  const crearReto = async () => {
    if (!nombre || !fechaInicio || !fechaFin) return
    setSaving(true)
    const supabase = createClient()

    const { data: reto, error } = await supabase
      .from('challenges')
      .insert({
        name: nombre,
        metric: 'calories',
        start_date: fechaInicio,
        end_date: fechaFin,
        rules: reglas,
        status: 'active',
        created_by: user.id
      })
      .select()
      .single()

    if (reto) {
      await supabase.from('challenge_participants').insert({
        challenge_id: reto.id,
        user_id: user.id,
        status: 'accepted'
      })
      setRetos([...retos, reto])
      setShowForm(false)
      setNombre(''); setFechaInicio(''); setFechaFin(''); setReglas('')
    }
    setSaving(false)
  }

  const s = { minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'20px', maxWidth:'480px', margin:'0 auto' }

  return (
    <div style={s}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'24px', fontWeight:900, color:'#ff4d00' }}>SPORT BRO'S</div>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>← Inicio</button>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5' }}>Mis Retos</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background:'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', color:'#fff', padding:'10px 18px', borderRadius:'10px', cursor:'pointer', fontWeight:700, fontSize:'14px' }}>
          {showForm ? 'Cancelar' : '+ Crear Reto'}
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:800, color:'#f0f0f5', marginBottom:'16px' }}>🏆 Nuevo Reto</div>

          <div style={{ marginBottom:'12px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>NOMBRE DEL RETO</div>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Quema Junio 🔥"
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FECHA INICIO</div>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FECHA FIN</div>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none' }} />
            </div>
          </div>

          <div style={{ marginBottom:'12px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>REGLAS</div>
            <textarea value={reglas} onChange={e => setReglas(e.target.value)} placeholder="Ej: Mínimo 30 min por sesión. Se requiere foto de evidencia."
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', minHeight:'80px', resize:'none' }} />
          </div>

          <button onClick={crearReto} disabled={saving}
            style={{ width:'100%', padding:'14px', background: saving ? '#333' : 'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:800, fontSize:'15px', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Creando...' : 'Crear Reto →'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', color:'#5a5a72', padding:'40px' }}>Cargando retos...</div>
      ) : retos.length === 0 ? (
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
              <div style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'6px', letterSpacing:'1px' }}>
                ACTIVO
              </div>
            </div>
            <div style={{ fontSize:'12px', color:'#5a5a72', marginBottom:'8px' }}>
              📅 {reto.start_date} → {reto.end_date}
            </div>
            {reto.rules && <div style={{ fontSize:'12px', color:'#5a5a72', lineHeight:'1.5' }}>📋 {reto.rules}</div>}
            <button onClick={() => router.push('/registrar')}
              style={{ marginTop:'14px', width:'100%', padding:'10px', background:'rgba(255,77,0,0.1)', border:'1px solid rgba(255,77,0,0.3)', borderRadius:'8px', color:'#ff4d00', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              🔥 Registrar sesión
            </button>
          </div>
        ))
      )}

      <div style={{ position:'fixed', bottom:'24px', right:'24px', display:'flex', gap:'10px' }}>
        <button onClick={() => router.push('/registrar')} style={{ background:'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', color:'#fff', width:'56px', height:'56px', borderRadius:'50%', fontSize:'24px', cursor:'pointer', boxShadow:'0 4px 20px rgba(255,77,0,0.4)' }}>📷</button>
      </div>
    </div>
  )
} 
