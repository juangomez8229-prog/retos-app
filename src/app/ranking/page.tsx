'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [retosRanking, setRetosRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [tab, setTab] = useState<'global'|'retos'>('global')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: global } = await supabase
        .from('global_ranking')
        .select('*')
        .order('position', { ascending: true })
        .limit(20)
      setRanking(global || [])

      const { data: misRetos } = await supabase
        .from('challenge_ranking')
        .select('*')
        .order('position', { ascending: true })
      setRetosRanking(misRetos || [])

      setLoading(false)
    }
    load()
  }, [])

  const medalColors: any = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' }

  return (
    <div style={{ minHeight:'100vh', background:'#080c10', fontFamily:'sans-serif', padding:'20px', maxWidth:'480px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'24px', fontWeight:900, color:'#ff4d00' }}>SPORT BRO'S</div>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'1px solid #25252f', color:'#5a5a72', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>← Inicio</button>
      </div>

      <div style={{ fontSize:'20px', fontWeight:800, color:'#f0f0f5', marginBottom:'16px' }}>🏆 Ranking</div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {(['global','retos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'10px', background: tab === t ? 'linear-gradient(135deg,#ff4d00,#ff8c00)' : '#111116', border: tab === t ? 'none' : '1px solid #25252f', borderRadius:'10px', color: tab === t ? '#fff' : '#5a5a72', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
            {t === 'global' ? '🌍 Global' : '⚔️ Por Reto'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'#5a5a72', padding:'40px' }}>Cargando ranking...</div>
      ) : tab === 'global' ? (
        ranking.length === 0 ? (
          <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📊</div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'#f0f0f5', marginBottom:'8px' }}>Sin datos aún</div>
            <div style={{ fontSize:'13px', color:'#5a5a72' }}>Registra tu primera sesión para aparecer aquí</div>
          </div>
        ) : (
          <>
            {ranking.slice(0,3).length > 0 && (
              <div style={{ background:'linear-gradient(135deg,#1a0a00,#0f0800)', border:'1px solid rgba(255,77,0,0.2)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', color:'#5a5a72', fontWeight:700, letterSpacing:'2px', marginBottom:'16px', textAlign:'center' }}>TOP 3 — ESTE MES</div>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'12px' }}>
                  {[ranking[1], ranking[0], ranking[2]].filter(Boolean).map((r, i) => {
                    const pos = i === 0 ? 2 : i === 1 ? 1 : 3
                    const height = pos === 1 ? 80 : pos === 2 ? 60 : 45
                    return (
                      <div key={r.user_id} style={{ textAlign:'center', flex:1 }}>
                        <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`linear-gradient(135deg,${medalColors[pos]},${medalColors[pos]}99)`, margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:900, color:'#000', border:`2px solid ${medalColors[pos]}` }}>
                          {r.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontSize:'11px', fontWeight:700, color:'#f0f0f5', marginBottom:'2px' }}>{r.full_name?.split(' ')[0]}</div>
                        <div style={{ fontSize:'12px', fontWeight:800, color: medalColors[pos] }}>{r.total_calories?.toLocaleString()}</div>
                        <div style={{ fontSize:'9px', color:'#5a5a72' }}>kcal</div>
                        <div style={{ height:`${height}px`, background:`linear-gradient(180deg,${medalColors[pos]},${medalColors[pos]}44)`, borderRadius:'6px 6px 0 0', marginTop:'8px' }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {ranking.map((r: any) => (
              <div key={r.user_id} style={{ background: r.user_id === userId ? 'rgba(255,77,0,0.08)' : '#111116', border: r.user_id === userId ? '1px solid rgba(255,77,0,0.35)' : '1px solid #25252f', borderRadius:'12px', padding:'14px 16px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ fontSize:'18px', fontWeight:900, width:'28px', textAlign:'center', color: medalColors[r.position] || '#5a5a72' }}>
                  {r.position <= 3 ? ['🥇','🥈','🥉'][r.position-1] : r.position}
                </div>
                <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#ff4d00,#ff8c00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {r.full_name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color: r.user_id === userId ? '#ff4d00' : '#f0f0f5' }}>
                    {r.full_name} {r.user_id === userId ? '← Tú' : ''}
                  </div>
                  <div style={{ fontSize:'11px', color:'#5a5a72' }}>{r.total_sessions} sesiones</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'20px', fontWeight:900, color:'#ff4d00', lineHeight:1 }}>{r.total_calories?.toLocaleString()}</div>
                  <div style={{ fontSize:'10px', color:'#5a5a72' }}>kcal</div>
                </div>
              </div>
            ))}
          </>
        )
      ) : (
        retosRanking.length === 0 ? (
          <div style={{ background:'#111116', border:'1px solid #25252f', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>⚔️</div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'#f0f0f5', marginBottom:'8px' }}>Sin retos activos</div>
            <div style={{ fontSize:'13px', color:'#5a5a72' }}>Crea un reto para ver el ranking aquí</div>
            <button onClick={() => router.push('/retos')} style={{ marginTop:'16px', padding:'10px 20px', background:'linear-gradient(135deg,#ff4d00,#ff8c00)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, cursor:'pointer' }}>
              Crear Reto →
            </button>
          </div>
        ) : (
          retosRanking.map((r: any) => (
            <div key={`${r.challenge_id}-${r.user_id}`} style={{ background: r.user_id === userId ? 'rgba(255,77,0,0.08)' : '#111116', border: r.user_id === userId ? '1px solid rgba(255,77,0,0.35)' : '1px solid #25252f', borderRadius:'12px', padding:'14px 16px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ fontSize:'18px', fontWeight:900, width:'28px', textAlign:'center', color: medalColors[r.position] || '#5a5a72' }}>
                {r.position <= 3 ? ['🥇','🥈','🥉'][r.position-1] : r.position}
              </div>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#ff4d00,#ff8c00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                {r.full_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:700, color: r.user_id === userId ? '#ff4d00' : '#f0f0f5' }}>
                  {r.full_name} {r.user_id === userId ? '← Tú' : ''}
                </div>
                <div style={{ fontSize:'11px', color:'#5a5a72' }}>{r.total_sessions} sesiones · {r.total_minutes} min</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'20px', fontWeight:900, color:'#ff4d00', lineHeight:1 }}>{r.total_calories?.toLocaleString()}</div>
                <div style={{ fontSize:'10px', color:'#5a5a72' }}>kcal</div>
              </div>
            </div>
          ))
        )
      )}
    </div>
  )
}