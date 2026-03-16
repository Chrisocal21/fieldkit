'use client'

import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { useBusinessCardStore } from '@/store/businessCardStore'

interface BusinessCardGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CardData {
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
}

export default function BusinessCardGeneratorModal({ isOpen, onClose }: BusinessCardGeneratorModalProps) {
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light')
  const [profileName, setProfileName] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const cardRef = useRef<HTMLDivElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const profiles = useBusinessCardStore((state) => state.profiles)
  const addProfile = useBusinessCardStore((state) => state.addProfile)
  const deleteProfile = useBusinessCardStore((state) => state.deleteProfile)
  const getProfileById = useBusinessCardStore((state) => state.getProfileById)

  // Generate QR code when website changes
  useEffect(() => {
    if (cardData.website && qrCanvasRef.current) {
      const url = cardData.website.startsWith('http') 
        ? cardData.website 
        : `https://${cardData.website}`
      
      QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 80,
        margin: 1,
        color: {
          dark: theme === 'light' ? '#000000' : '#ffffff',
          light: '#00000000',
        },
      })
    }
  }, [cardData.website, theme])

  const handleExport = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
      })

      const link = document.createElement('a')
      link.download = `business-card-${cardData.name.replace(/\s+/g, '-').toLowerCase() || 'card'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to export:', err)
    }
  }

  const handleCopy = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
          alert('Business card copied to clipboard!')
        }
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      alert('Please enter a profile name')
      return
    }

    addProfile({
      ...cardData,
      theme,
      profileName: profileName.trim(),
    })
    
    setProfileName('')
    alert('Profile saved!')
  }

  const handleLoadProfile = (profileId: string) => {
    const profile = getProfileById(profileId)
    if (profile) {
      setCardData({
        name: profile.name,
        title: profile.title,
        company: profile.company,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
      })
      setTheme(profile.theme)
      setSelectedProfileId(profileId)
    }
  }

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Delete this profile?')) {
      deleteProfile(profileId)
      if (selectedProfileId === profileId) {
        setSelectedProfileId('')
      }
    }
  }

  const handleNewCard = () => {
    setCardData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
    })
    setTheme('light')
    setSelectedProfileId('')
    setProfileName('')
  }

  if (!isOpen) return null

  const themeStyles = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    blue: 'bg-gradient-to-br from-blue-600 to-blue-800 text-white',
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Business Card Generator
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                {/* Profile Management */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Saved Profiles
                    </h3>
                    <button
                      onClick={handleNewCard}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      New Card
                    </button>
                  </div>
                  
                  {profiles.length > 0 && (
                    <select
                      value={selectedProfileId}
                      onChange={(e) => handleLoadProfile(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Select a profile...</option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.profileName} ({profile.name})
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Profile name (e.g., Personal, Work)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>

                  {selectedProfileId && (
                    <button
                      onClick={() => handleDeleteProfile(selectedProfileId)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Delete Current Profile
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 pt-4">
                  Card Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={cardData.title}
                    onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                    placeholder="Field Service Manager"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={cardData.company}
                    onChange={(e) => setCardData({ ...cardData, company: e.target.value })}
                    placeholder="ACME Services"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={cardData.email}
                    onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={cardData.phone}
                    onChange={(e) => setCardData({ ...cardData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={cardData.website}
                    onChange={(e) => setCardData({ ...cardData, website: e.target.value })}
                    placeholder="www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    A QR code will be generated for your website
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('blue')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        theme === 'blue'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      Blue
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Preview
                </h3>

                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-8">
                  <div
                    ref={cardRef}
                    className={`w-96 h-56 rounded-xl shadow-2xl p-8 flex justify-between ${themeStyles[theme]}`}
                  >
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {cardData.name || 'Your Name'}
                        </h2>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                          {cardData.title || 'Your Title'}
                        </p>
                        {cardData.company && (
                          <p className={`text-sm mt-1 font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                            {cardData.company}
                          </p>
                        )}
                      </div>

                      <div className={`space-y-1 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        {cardData.email && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">{cardData.email}</span>
                          </div>
                        )}
                        {cardData.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-xs">{cardData.phone}</span>
                          </div>
                        )}
                        {cardData.website && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span className="text-xs">{cardData.website}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Code */}
                    {cardData.website && (
                      <div className="flex items-center justify-center ml-4">
                        <div className="bg-white p-2 rounded">
                          <canvas ref={qrCanvasRef} className="w-20 h-20" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Download Image
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    Copy Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
