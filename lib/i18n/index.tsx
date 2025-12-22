'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import en from './locales/en.json'
import id from './locales/id.json'

type Locale = 'en' | 'id'
type Translations = typeof en

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, params?: Record<string, string | number>) => string
}

const translations: Record<Locale, Translations> = { en, id }

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('locale') as Locale | null
            if (savedLocale && (savedLocale === 'en' || savedLocale === 'id')) {
                return savedLocale
            }
            const browserLang = navigator.language.split('-')[0]
            return browserLang === 'id' ? 'id' : 'en'
        }
        return 'id'
    })

    useEffect(() => {
        // Update HTML lang attribute on mount
        document.documentElement.lang = locale
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('locale', newLocale)
        // Update HTML lang attribute
        document.documentElement.lang = newLocale
    }

    // Translation function with interpolation support
    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.')
        let value: unknown = translations[locale]

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k]
            } else {
                // Fallback to key if translation not found
                console.warn(`Translation not found for key: ${key}`)
                return key
            }
        }

        if (typeof value !== 'string') {
            return key
        }

        // Replace parameters
        if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
                return params[paramKey]?.toString() ?? `{{${paramKey}}}`
            })
        }

        return value
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider')
    }
    return context
}

// Get available locales
export const locales: { code: Locale; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
]
