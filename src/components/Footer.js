import Link from 'next/link';
import { FaFacebook, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0c3a5e] text-white">
      {/* Islamic pattern top border */}
      <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#f0c040] to-[#c9a84c]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c9a84c] to-[#f0c040] rounded-full flex items-center justify-center text-white font-bold text-xl">
                ☪
              </div>
              <div>
                <p className="font-bold text-sm">Holy Relationship</p>
                <p className="text-[#c9a84c] text-xs">Marriage Matrimony</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              বাংলাদেশের বিশ্বস্ত ইসলামিক বিবাহ সেবা। হালাল উপায়ে আপনার জীবনসঙ্গী খুঁজুন।
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#c9a84c] rounded-lg flex items-center justify-center transition-colors">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#c9a84c] rounded-lg flex items-center justify-center transition-colors">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[#c9a84c] mb-4 text-sm uppercase tracking-wider">দ্রুত লিংক</h3>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'আমাদের সম্পর্কে' },
                { href: '/how-it-works', label: 'কিভাবে কাজ করে' },
                { href: '/search', label: 'প্রোফাইল খুঁজুন' },
                { href: '/register', label: 'বায়োডেটা তৈরি করুন' },
                { href: '/payment/pricing', label: 'মূল্য তালিকা' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors flex items-center gap-2">
                    <span className="text-[#c9a84c]">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-[#c9a84c] mb-4 text-sm uppercase tracking-wider">সহায়তা</h3>
            <ul className="space-y-2">
              {[
                { href: '/faq', label: 'সাধারণ প্রশ্ন (FAQ)' },
                { href: '/privacy-policy', label: 'গোপনীয়তা নীতি' },
                { href: '/terms', label: 'শর্তাবলী' },
                { href: '/contact', label: 'যোগাযোগ করুন' },
                { href: '/report', label: 'অভিযোগ করুন' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors flex items-center gap-2">
                    <span className="text-[#c9a84c]">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[#c9a84c] mb-4 text-sm uppercase tracking-wider">যোগাযোগ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <FaPhone size={14} className="text-[#c9a84c] flex-shrink-0" />
                <span>+880 1682981828</span>
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <FaEnvelope size={14} className="text-[#c9a84c] flex-shrink-0" />
                <span>info@holyrelationship.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <FaMapMarkerAlt size={14} className="text-[#c9a84c] flex-shrink-0 mt-1" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-5">
              <p className="text-xs text-white/40 mb-2">পেমেন্ট গ্রহণ করা হয়</p>
              <div className="flex gap-2">
                {['bKash', 'Nagad', 'Rocket'].map((m) => (
                  <span key={m} className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/70">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© ২০২৪ Holy Relationship Marriage Matrimony. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            <span className="text-[#c9a84c]">☪</span>
            ইসলামিক মূল্যবোধে পরিচালিত
          </p>
        </div>
      </div>
    </footer>
  );
}
