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
      backgroundColor: '#1B2E5E', // C.dark
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      {/* YENİ LOGOMUZ BURADA KOCAMAN DURUYOR */}
      <div style={{ 
        transform: fade ? 'scale(0.95)' : 'scale(1)', 
        transition: 'transform 0.5s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <LogoIcon size={80} variant="dark" />
        
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#F8F7F4', marginTop: '16px', letterSpacing: '-0.5px' }}>
          yap<span style={{ color: '#E8870A' }}>ivo</span>
        </div>
        
        <p style={{ color: 'rgba(248,247,244,0.5)', fontSize: '15px', marginTop: '8px', letterSpacing: '0.5px', fontWeight: '500' }}>
          İnşaatınızın Dijital Defteri
        </p>
      </div>
      
    </div>
  )
}