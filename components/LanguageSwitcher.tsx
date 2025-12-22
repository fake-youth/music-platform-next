'use client'

import { useState } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useI18n, locales } from '@/lib/i18n'

export default function LanguageSwitcher() {
    const { locale, setLocale } = useI18n()
    const [isOpen, setIsOpen] = useState(false)

    const currentLocale = locales.find((l) => l.code === locale) || locales[0]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 border border-gray-700 transition-all"
            >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">{currentLocale.flag}</span>
                <span className="text-sm text-gray-300 hidden sm:inline">{currentLocale.name}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {locales.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => {
                                    setLocale(l.code)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors ${locale === l.code ? 'bg-gray-800' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{l.flag}</span>
                                    <span className="text-white">{l.name}</span>
                                </div>
                                {locale === l.code && (
                                    <Check className="w-4 h-4 text-purple-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
