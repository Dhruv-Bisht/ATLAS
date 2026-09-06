import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'ATLAS — Global Opportunity Intelligence', description:'A live global map of jobs, internships and scholarships.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
