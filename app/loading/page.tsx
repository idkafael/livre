'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoadingPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/seguro')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-white flex justify-center items-center flex-col">
      <div className="text-center">
        <p className="text-xl text-black/90 mb-6 font-normal">Preparando tudo para sua compra</p>
        <div className="w-12 h-12 border-4 border-ml-border border-t-[#3483fa] rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
