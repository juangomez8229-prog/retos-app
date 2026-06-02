'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistrarPage() {
  const [user, setUser] = useState<any>(null)
  const [retos, setRetos] = useState<any[]>([])
  const [retoId, setRetoId] = useState('')
  const [actividad, setActividad] = useState('gym')
  const [calorias, setCalorias] = useState('')
  const [duracion, setDuracion] = useState('')
  const [ritmo, setRitmo] = useState('')
  const [notas, setNotas] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [exito, setExito] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('challenge_participants')
        .select('challenge_id, challenges(id, name)')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
      const lista = data?.map((d: any) => d.challenges) || []
      setRetos(lista)
      if (lista.length > 0) setRetoId(lista[0].id)
    }
    load()
  }, [])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const registrar = async () => {
    if (!foto || !calorias || !duracion || !retoId) return
    setSaving(true)
    const supabase = createClient()

    const ext = foto.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('evidences')
      .upload(path, foto, { upsert: true })

    if (uploadError) {
      alert('Error subiendo foto: ' + uploadError.message)
      setSaving(false)
      return
    }

    const { data: urlData } = supabase.storage.from('evidences').getPublicUrl(path)

    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      challenge_id: retoId,
      activity_type: actividad,
      calories: parseInt(calorias),
      duration_minutes: parseInt(duracion),
      avg_heart_rate: ritmo ? parseInt(ritmo) : null,
      notes: notas || null,
      evidence_url: urlData.publicUrl,
      evidence_uploaded_at: new Date().toISOString(),
      session_date: fecha,
    })

    if (!error) {
      setExito(true)
      setTimeout(() => router.push('/retos'), 2000)
    } else {
      alert('Error: ' + error.message)
    }
    setSaving(false)
  }

  const inp = { width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', fontFamily:'sans-serif' }

  if (exito) return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:'60px', marginBottom:'16px' }}>✅</div>
      <div style={{ fontSize:'22px', fontWeight:800, color:'#22c55e', marginBottom:'8px' }}>¡Sesión registrada!</div>
      <div style={{ fontSize:'14px', color:'#5a5a72' }}>Volviendo a tus retos...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'20px', maxWidth:'480px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'24px', fontWeight:900, color:'#ff4d00' }}>SPORT BRO'S</div>
        <button onClick={() => router.push('/retos')} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>← Retos</button>
      </div>

      <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5', marginBottom:'20px' }}>Registrar Sesión</div>

      <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>

        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>RETO</div>
          <select value={retoId} onChange={e => setRetoId(e.target.value)} style={{...inp, appearance:'none'}}>
            {retos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FOTO DE EVIDENCIA *</div>
          <label style={{ cursor:'pointer', display:'block' }}>
            <div style={{ width:'100%', height:'160px', background:'#18181f', border: fotoPreview ? 'none' : '2px dashed #ff4d00', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
              {fotoPreview
                ? <img src={fotoPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ textAlign:'center', color:'#5a5a72' }}>
                    <div style={{ fontSize:'36px', marginBottom:'8px' }}>📷</div>
                    <div style={{ fontSize:'13px' }}>Toca para subir foto del entreno</div>
                    <div style={{ fontSize:'11px', marginTop:'4px', color:'#ff4d00' }}>o captura de tu reloj</div>
                  </div>
              }
            </div>
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display:'none' }} />
          </label>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'8px' }}>ACTIVIDAD</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {[['gym','🏋️','Gym'],['running','🏃','Correr'],['cycling','🚴','Ciclismo'],['swimming','🏊','Natación'],['hiit','⚡','HIIT'],['other','🎯','Otro']].map(([val, icon, label]) => (
              <div key={val} onClick={() => setActividad(val)}
                style={{ padding:'10px 6px', background: actividad === val ? 'rgba(255,77,0,0.15)' : '#18181f', border: actividad === val ? '1px solid #ff4d00' : '1px solid #25252f', borderRadius:'10px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:'20px' }}>{icon}</div>
                <div style={{ fontSize:'11px', color: actividad === val ? '#ff4d00' : '#5a5a72', fontWeight:600, marginTop:'4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>CALORÍAS *</div>
            <input type="number" value={calorias} onChange={e => setCalorias(e.target.value)} placeholder="650" style={inp} />
          </div>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>DURACIÓN (min) *</div>
            <input type="number" value={duracion} onChange={e => setDuracion(e.target.value)} placeholder="60" style={inp} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>RITMO CARDÍACO</div>
            <input type="number" value={ritmo} onChange={e => setRitmo(e.target.value)} placeholder="138 bpm" style={inp} />
          </div>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>FECHA</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>NOTA PARA EL GRUPO</div>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Día brutal de pierna. Sin excusas 💪" style={{...inp, minHeight:'70px', resize:'none'}} />
        </div>

        <button onClick={registrar} disabled={saving || !foto || !calorias || !duracion}
          style={{ width:'100%', padding:'15px', background: (saving || !foto || !calorias || !duracion) ? '#333' : 'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'16px', cursor: (saving || !foto || !calorias || !duracion) ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Publicando...' : '🔥 Publicar en el grupo →'}
        </button>

        <div style={{ fontSize:'11px', color:'#5a5a72', textAlign:'center', marginTop:'10px' }}>
          * Foto, calorías y duración son obligatorios
        </div>
      </div>
    </div>
  )
} 
