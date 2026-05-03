'use client'

import { useEffect, useState } from 'react'
import { LogoIcon } from '../dashboard/shared'

export default function SplashScreen() {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    // 1.5 saniye sonra yavaşça kaybolmaya başla
    const fadeTimer = setTimeout(() => {
      setFade(true)
    }, 1500)

    // 2 saniye sonra tamamen DOM'dan kaldır
    const hideTimer = setTimeout(() => {
      setShow(false)
    }, 2000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#1B2E5E',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      <div style={{ 
        transform: fade ? 'scale(0.95)' : 'scale(1)', 
        transition: 'transform 0.5s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* ÇERÇEVELİ LOGO (OUTLINE APP ICON) */}
        <div style={{
          width: '120px',
          height: '120px',
          border: '4px solid #E8870A', // Amber Çerçeve
          borderRadius: '28px', // Mobil uygulama ikonu kıvrımı
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)' // Hafif bir derinlik
        }}>
          <LogoIcon size={76} variant="dark" />
        </div>
        
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#F8F7F4', letterSpacing: '-0.5px' }}>
          yap<span style={{ color: '#E8870A' }}>ivo</span>
        </div>
        
        <p style={{ color: 'rgba(248,247,244,0.5)', fontSize: '15px', marginTop: '8px', letterSpacing: '0.5px', fontWeight: '500' }}>
          İnşaatınızın Dijital Defteri
        </p>
      </div>
      
    </div>
  )
}