'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
      else setProfile({ full_name: user.user_metadata?.full_name || user.email, username: user.user_metadata?.username || user.email?.split('@')[0], avatar_url: null })
      setLoading(false)
    }
    load()
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080c10', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff4d00', fontSize:'20px', fontWeight:700 }}>
      ⚡ Cargando...
    </div>
  )

  const menuItems = [
    { icon:'🏆', label:'Mis Retos', sub:'Ver y crear retos', path:'/retos', color:'#ff4d00' },
    { icon:'📷', label:'Registrar Sesión', sub:'Subir evidencia del entreno', path:'/registrar', color:'#ff8c00' },
    { icon:'📊', label:'Ranking', sub:'Ver quién va ganando', path:'/ranking', color:'#22c55e' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'24px', maxWidth:'480px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'26px', fontWeight:900, color:'#ff4d00', letterSpacing:'2px' }}>SPORT BRO'S</div>
        <button onClick={logout} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>
          Salir
        </button>
      </div>

      <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'20px', padding:'24px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg,#ff4d00,#ff8c00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:900, color:'#fff', overflow:'hidden', flexShrink:0 }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="avatar" />
            : (profile?.full_name?.[0] || '?').toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5' }}>{profile?.full_name}</div>
          <div style={{ fontSize:'13px', color:'#5a5a72' }}>@{profile?.username}</div>
          <div style={{ fontSize:'11px', color:'#ff4d00', marginTop:'4px', fontWeight:600 }}>🔥 Listo para competir</div>
        </div>
      </div>

      <div style={{ marginBottom:'12px', fontSize:'11px', color:'#5a5a72', fontWeight:700, letterSpacing:'2px' }}>MENÚ PRINCIPAL</div>

      {menuItems.map((item) => (
        <div key={item.path} onClick={() => router.push(item.path)}
          style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'18px 20px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer', transition:'all 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = item.color)}
          onMouseOut={e => (e.currentTarget.style.borderColor = '#25252f')}
        >
          <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:`rgba(255,77,0,0.1)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>
            {item.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'16px', fontWeight:700, color:'#f0f0f5' }}>{item.label}</div>
            <div style={{ fontSize:'12px', color:'#5a5a72', marginTop:'2px' }}>{item.sub}</div>
          </div>
          <div style={{ color:'#5a5a72', fontSize:'18px' }}>›</div>
        </div>
      ))}

      <div style={{ background:'linear-gradient(135deg,#1a0a00,#0f0a00)', border:'1px solid rgba(255,77,0,0.2)', borderRadius:'16px', padding:'18px 20px', marginTop:'8px', textAlign:'center' }}>
        <div style={{ fontSize:'13px', color:'#5a5a72', marginBottom:'4px' }}>Tu posición global</div>
        <div style={{ fontSize:'32px', fontWeight:900, color:'#ff4d00' }}>—</div>
        <div style={{ fontSize:'12px', color:'#5a5a72' }}>Registra tu primera sesión para aparecer en el ranking</div>
      </div>
    </div>
  )
}