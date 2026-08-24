import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Holy Relationship Marriage Matrimony | হোলি রিলেশনশিপ ম্যাট্রিমনি',
  description:
    'Bangladesh\'s premier Islamic matrimony service. Find your perfect halal match with Holy Relationship Marriage Matrimony. বাংলাদেশের সেরা ইসলামিক বিবাহ সেবা।',
  keywords: 'matrimony, bangladesh, islamic, marriage, biodata, বিবাহ, ম্যাট্রিমনি, বায়োডেটা',
  authors: [{ name: 'Holy Relationship Matrimony' }],
  openGraph: {
    title: 'Holy Relationship Marriage Matrimony',
    description: 'Find your perfect halal match in Bangladesh',
    type: 'website',
    locale: 'bn_BD',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={inter.variable}>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2113556573683821"
     crossorigin="anonymous"></script>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a5276',
                  color: '#fff',
                  borderRadius: '10px',
                  fontSize: '14px',
                },
                success: {
                  style: { background: '#1b6a3b' },
                  iconTheme: { primary: '#fff', secondary: '#1b6a3b' },
                },
                error: {
                  style: { background: '#c0392b' },
                  iconTheme: { primary: '#fff', secondary: '#c0392b' },
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
