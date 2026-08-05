import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'JobBoard AI-Match | AI-Powered Job Platform',
  description: 'Find jobs with real-time AI resume-to-job matching score calculations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFC] text-[#0F172A] min-h-screen flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
