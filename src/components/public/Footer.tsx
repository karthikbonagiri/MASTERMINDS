// src/components/public/Footer.tsx
import Link from 'next/link';
import { FaGraduationCap, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Master<span className="text-blue-400">Minds</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Your one-stop destination for government job notifications, mock tests,
              study materials, and education resources. Empowering careers across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/jobs', label: 'Job Notifications' },
                { href: '/tests', label: 'Mock Tests' },
                { href: '/materials', label: 'Study Materials' },
                { href: '/articles', label: 'Education Info' },
                { href: '/current-affairs', label: 'Current Affairs' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 hover:text-green-400 transition-colors">
                <FaWhatsapp className="text-green-400 flex-shrink-0" />
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@masterminds.in">support@masterminds.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Master Minds. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-300 cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
