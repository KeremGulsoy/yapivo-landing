'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Minimum 2 saniye göster
    const fadeTimer = setTimeout(() => setFading(true), 2000)
    const hideTimer = setTimeout(() => setVisible(false), 2500)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#1B2E5E',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      opacity: fading ? 0 : 1,
      pointerEvents: fading ? 'none' : 'all',
      fontFamily: 'Outfit, sans-serif',
    }}>
      {/* Logo animasyonu */}
      <div style={{
        animation: 'splashPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        <svg width="80" height="80" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="22" fill="#E8870A"/>
          <line x1="22" y1="18" x2="50" y2="52" stroke="#1B2E5E" strokeWidth="12" strokeLinecap="round"/>
          <line x1="78" y1="18" x2="50" y2="52" stroke="#1B2E5E" strokeWidth="12" strokeLinecap="round"/>
          <line x1="50" y1="52" x2="50" y2="84" stroke="#1B2E5E" strokeWidth="12" strokeLinecap="round"/>
          <rect x="38" y="68" width="10" height="10" rx="2" fill="#F8F7F4"/>
          <rect x="52" y="68" width="10" height="10" rx="2" fill="#F8F7F4"/>
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{
        marginTop: '20px',
        fontSize: '32px', fontWeight: '800',
        color: '#F8F7F4',
        animation: 'splashFadeUp 0.6s 0.2s ease forwards',
        opacity: 0,
      }}>
        yap<span style={{ color: '#E8870A' }}>ivo</span>
      </div>

      {/* Slogan */}
      <div style={{
        marginTop: '8px',
        fontSize: '14px', fontWeight: '400',
        color: 'rgba(248,247,244,0.45)',
        letterSpacing: '0.05em',
        animation: 'splashFadeUp 0.6s 0.35s ease forwards',
        opacity: 0,
      }}>
        İnşaatınızın Dijital Defteri
      </div>

      {/* Animasyon keyframes */}
      <style>{`
        @keyframes splashPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes splashFadeUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}