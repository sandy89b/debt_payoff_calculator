import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Globe, HelpCircle, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/auth/signin');
  };

  return (
    <header className="bg-gray-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Sidebar trigger and Logo */}
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="md:hidden text-gray-700 hover:text-brand-green transition-colors p-2" />
            <img 
              src="/lovable-uploads/45e07ccd-ab70-45c2-aec8-3ab85f43ded3.png" 
              alt="Legacy Mindset Solutions Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">
                Legacy Mindset Solutions
              </h1>
              <p className="text-sm text-gray-600">
                Harmony in Finance, Harmony in Life
              </p>
            </div>
          </div>

          {/* Contact Info & CTA */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-700">
              <a 
                href="tel:+13013810529" 
                className="flex items-center space-x-1 hover:text-brand-green transition-colors touch-target"
              >
                <Phone className="h-4 w-4" />
                <span>(301) 381-0529</span>
              </a>
              <a 
                href="mailto:phil@legacymindsetsolutions.com" 
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
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.name || user?.email}
                  </span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-brand-gray text-brand-gray hover:bg-brand-gray hover:text-white font-semibold touch-target px-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-semibold touch-target px-3 lg:px-4"
                onClick={() => navigate('/auth/signin')}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};