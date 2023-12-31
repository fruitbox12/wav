import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import './globals.css'
// style + assets
import 'assets/scss/style.scss'

import AppLayout from 'layout/app.layout'
import { ReduxProvider } from './redux-provider'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'weave-Automate Web3 and Web2 Application',
    description: 'Generated by create next app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <body className={`${inter.className} min-h-screen bg-white`}>
                <ReduxProvider>
                    <AppLayout>{children}</AppLayout>
                </ReduxProvider>
            </body>
        </html>
    )
}
