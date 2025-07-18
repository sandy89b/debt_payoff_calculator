import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Globe, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-soft border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/45e07ccd-ab70-45c2-aec8-3ab85f43ded3.png" 
              alt="Legacy Mindset Solutions Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-brand-charcoal">
                Legacy Mindset Solutions
              </h1>
              <p className="text-sm text-brand-gray">
                Harmony in Finance, Harmony in Life
              </p>
            </div>
          </div>

          {/* Contact Info & CTA */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="hidden lg:flex items-center space-x-6 text-sm text-brand-gray">
              <a 
                href="tel:+1234567890" 
                className="flex items-center space-x-1 hover:text-brand-green transition-colors touch-target"
              >
                <Phone className="h-4 w-4" />
                <span>(123) 456-7890</span>
              </a>
              <a 
                href="mailto:info@legacymindsetsolutions.com" 
                className="flex items-center space-x-1 hover:text-brand-green transition-colors touch-target"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </a>
              <a 
                href="https://legacymindsetsolutions.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-brand-green transition-colors touch-target"
              >
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </a>
            </div>
            
            <ThemeToggle />
            
            <Button 
              className="bg-gradient-hero hover:opacity-90 text-white font-semibold touch-target px-3 lg:px-4"
              onClick={() => window.open('https://legacymindsetsolutions.com/contact', '_blank')}
            >
              <span className="hidden sm:inline">Free Consultation</span>
              <span className="sm:hidden">Contact</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};