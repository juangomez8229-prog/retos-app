'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setUsername(data.username || '')
        setBio(data.bio || '')
        setWeightKg(data.weight_kg || '')
        setHeightCm(data.height_cm || '')
        setAvatarPreview(data.avatar_url || '')
      }
    }
    load()
  }, [])

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const guardar = async () => {
    if (!fullName || !username) { setError('Nombre y usuario son obligatorios'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let avatarUrl = profile?.avatar_url || null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        bio: bio || null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Error al guardar: ' + updateError.message)
    } else {
      setExito(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setSaving(false)
  }

  const inp = { width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px', outline:'none', fontFamily:'sans-serif' }

  if (!profile) return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff4d00', fontSize:'18px', fontWeight:700 }}>
      Cargando...
    </div>
  )

  if (exito) return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:'60px', marginBottom:'16px' }}>✅</div>
      <div style={{ fontSize:'22px', fontWeight:800, color:'#22c55e' }}>¡Perfil actualizado!</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'20px', maxWidth:'480px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'24px', fontWeight:900, color:'#ff4d00' }}>SPORT BRO'S</div>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>← Inicio</button>
      </div>

      <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5', marginBottom:'20px' }}>✏️ Editar Perfil</div>

      <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'20px' }}>

        {/* FOTO */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <label style={{ cursor:'pointer' }}>
            <div style={{ width:'90px', height:'90px', borderRadius:'50%', margin:'0 auto 8px', background:'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'3px solid #ff4d00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:900, color:'#fff', overflow:'hidden' }}>
              {avatarPreview
                ? <img src={avatarPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="avatar" />
                : fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ fontSize:'12px', color:'#ff4d00', fontWeight:600 }}>Cambiar foto</div>
            <input type="file" accept="image/*" onChange={handleAvatar} style={{ display:'none' }} />
          </label>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>NOMBRE COMPLETO *</div>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan García" style={inp} />
          </div>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>USUARIO *</div>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="juang" style={inp} />
          </div>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>BIO</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." style={{...inp, minHeight:'70px', resize:'none'}} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>PESO (kg)</div>
            <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="75" style={inp} />
          </div>
          <div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontWeight:700, letterSpacing:'1px', marginBottom:'6px' }}>ALTURA (cm)</div>
            <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="175" style={inp} />
          </div>
        </div>

        {error && (
          <div style={{ background:'rgba(255,71,87,0.1)', border:'1px solid rgba(255,71,87,0.3)', borderRadius:'8px', padding:'10px', marginBottom:'16px', fontSize:'13px', color:'#ff4757' }}>
            {error}
          </div>
        )}

        <button onClick={guardar} disabled={saving}
          style={{ width:'100%', padding:'15px', background: saving ? '#333' : 'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Guardando...' : '💾 Guardar cambios'}
        </button>
      </div>
    </div>
  )
} 
