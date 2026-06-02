'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        if (!fullName || !username || !email || !password) {
          setError('Completa todos los campos'); setLoading(false); return
        }
        const { data, error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, username } }
        })
        if (e) throw e
        if (data.user && avatarFile) {
          const ext = avatarFile.name.split('.').pop()
          const path = `${data.user.id}/avatar.${ext}`
          await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', data.user.id)
        }
        router.push('/dashboard')
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password })
        if (e) throw e
        router.push('/dashboard')
      }
    } catch (err: any) { setError(err.message || 'Error al procesar') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'36px', fontWeight:900, color:'#ff4d00', letterSpacing:'2px' }}>SPORT BRO´S.</div>
          <div style={{ fontSize:'12px', color:'#5a5a72', letterSpacing:'3px' }}>RETOS DEPORTIVOS</div>
        </div>
        <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'20px', padding:'32px' }}>
          <div style={{ fontSize:'22px', fontWeight:900, color:'#f0f0f5', marginBottom:'6px' }}>
            {isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
          </div>
          <div style={{ fontSize:'13px', color:'#5a5a72', marginBottom:'24px' }}>
            {isRegister ? 'Únete y empieza a competir' : 'Bienvenido de nuevo, atleta'}
          </div>

          {isRegister && (
            <>
              <div style={{ textAlign:'center', marginBottom:'18px' }}>
                <label style={{ cursor:'pointer' }}>
                  <div style={{ width:'90px', height:'90px', borderRadius:'50%', margin:'0 auto 8px', background:'#18181f', border:'2px dashed #ff4d00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', overflow:'hidden' }}>
                    {avatarPreview ? <img src={avatarPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📷'}
                  </div>
                  <div style={{ fontSize:'12px', color:'#ff4d00', fontWeight:600 }}>Foto de perfil</div>
                  <input type="file" accept="image/*" onChange={handleAvatar} style={{ display:'none' }} />
                </label>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <div style={{ fontSize:'10px', color:'#5a5a72', marginBottom:'6px', fontWeight:700, letterSpacing:'1px' }}>NOMBRE</div>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan García"
                    style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px' }} />
                </div>
                <div>
                  <div style={{ fontSize:'10px', color:'#5a5a72', marginBottom:'6px', fontWeight:700, letterSpacing:'1px' }}>USUARIO</div>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="juang"
                    style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px' }} />
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom:'14px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', marginBottom:'6px', fontWeight:700, letterSpacing:'1px' }}>EMAIL</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px' }} />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', marginBottom:'6px', fontWeight:700, letterSpacing:'1px' }}>CONTRASEÑA</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width:'100%', background:'#18181f', border:'1px solid #25252f', borderRadius:'10px', padding:'12px', color:'#f0f0f5', fontSize:'14px' }} />
          </div>

          {error && <div style={{ background:'rgba(255,71,87,0.1)', border:'1px solid rgba(255,71,87,0.3)', borderRadius:'8px', padding:'10px', marginBottom:'16px', fontSize:'13px', color:'#ff4757' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'15px', background: loading ? '#333' : 'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'17px', fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Procesando...' : isRegister ? 'CREAR CUENTA →' : 'ENTRAR →'}
          </button>

          <div style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'#5a5a72' }}>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <span onClick={() => { setIsRegister(!isRegister); setError('') }}
              style={{ color:'#ff4d00', cursor:'pointer', fontWeight:600 }}>
              {isRegister ? 'Iniciar sesión' : 'Regístrate gratis'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}