import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { footerConfig } from '../config';

const socialIconMap = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  if (!footerConfig.logo) return null;

  return (
    <footer className="relative w-full bg-black border-t border-white/10">
      {/* Main footer content */}
      <div className="w-full px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="font-display font-black text-4xl text-white hover:text-pink transition-colors duration-300 inline-block mb-6"
            >
              {footerConfig.logo}<span className="text-pink">{footerConfig.logoAccent}</span>
            </a>
            {footerConfig.brandDescription && (
              <p className="font-body text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                {footerConfig.brandDescription}
              </p>
            )}

            {/* Social links */}
            {footerConfig.socialLinks.length > 0 && (
              <div className="flex gap-4">
                {footerConfig.socialLinks.map((social) => {
                  const IconComponent = socialIconMap[social.platform];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-12 h-12 border border-white/20 flex items-center justify-center text-white/50 hover:text-pink hover:border-pink transition-all duration-300"
                      data-cursor-hover
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Links sections */}
          {footerConfig.linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-white/50 text-sm hover:text-pink transition-colors duration-300"
                      data-cursor-hover
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        {(footerConfig.contact.address || footerConfig.contact.phone || footerConfig.contact.email) && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              {footerConfig.contact.address && (
                <div className="flex items-center gap-3 text-white/40">
                  <MapPin className="w-4 h-4 text-pink" />
                  <span className="font-body text-sm">{footerConfig.contact.address}</span>
                </div>
              )}
              {footerConfig.contact.phone && (
                <div className="flex items-center gap-3 text-white/40">
                  <Phone className="w-4 h-4 text-pink" />
                  <span className="font-body text-sm">{footerConfig.contact.phone}</span>
                </div>
              )}
              {footerConfig.contact.email && (
                <div className="flex items-center gap-3 text-white/40">
                  <Mail className="w-4 h-4 text-pink" />
                  <span className="font-body text-sm">{footerConfig.contact.email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="w-full px-6 lg:px-12 py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {footerConfig.copyrightText && (
            <p className="font-body text-white/30 text-xs">
              {currentYear} {footerConfig.copyrightText}
            </p>
          )}
          {footerConfig.legalLinks.length > 0 && (
            <div className="flex gap-6">
              {footerConfig.legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-white/30 text-xs hover:text-pink transition-colors duration-300"
                  data-cursor-hover
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Large decorative text */}
      {footerConfig.decorativeText && (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <div className="font-display font-black text-[15vw] text-white/[0.02] leading-none text-center translate-y-1/3">
            {footerConfig.decorativeText}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
