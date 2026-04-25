'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1B2E5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#F8F7F4', fontFamily: 'Outfit, sans-serif' }}>Yükleniyor...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7F4', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1B2E5E', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#F8F7F4' }}>
          yap<span style={{ color: '#E8870A' }}>ivo</span>
        </span>
        <button onClick={handleLogout} style={{
          backgroundColor: 'rgba(255,255,255,0.1)', color: '#F8F7F4',
          border: 'none', padding: '8px 16px', borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px'
        }}>
          Çıkış Yap
        </button>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1B2E5E', marginBottom: '8px' }}>
          Hoş Geldiniz!
        </h1>
        <p style={{ color: '#888780', marginBottom: '8px' }}>
          {user.email}
        </p>
        <p style={{ color: '#B4B2A9', fontSize: '14px' }}>
          Dashboard yakında burada olacak. Şu an sistemin çalıştığını test ediyoruz.
        </p>
      </div>
    </div>
  )
}