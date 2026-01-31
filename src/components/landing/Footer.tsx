import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Calendar,
  Phone,
  Facebook,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';
import acetLogo from '@/assets/acet-logo.jpeg';

const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Alumni', path: '/alumni' },
    { label: 'Careers', path: '/jobs' },
    { label: 'Events', path: '/events' },
  ];

  const supportLinks = [
    { label: 'Donate', path: '/fundraising' },
    { label: 'Contact', path: '#contact' },
    { label: 'Help Center', path: '#help' },
    { label: 'Privacy Policy', path: '#privacy' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
    { icon: Twitter, label: 'Twitter', url: 'https://twitter.com' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
  ];

  return (
    <footer className="border-t border-border bg-card">
      {/* Contact Section */}
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground">Contact Us</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email Us</p>
                  <a 
                    href="mailto:alumni@university.edu" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    alumni@university.edu
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Visit Us</p>
                  <p className="text-sm text-muted-foreground">
                    Alumni Relations Office<br />
                    University Campus
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Office Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri: 9AM-6PM<br />
                    Sat: 10AM-4PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground">Get in Touch</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary">
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="justify-start gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button className="justify-start gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Phone className="h-4 w-4" />
                Join WhatsApp Group
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border">
        <div className="container py-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            {/* Logo and Description */}
            <div className="flex items-center gap-4">
              <img 
                src={acetLogo} 
                alt="ACET Logo" 
                className="h-12 w-12 object-contain rounded-full border border-primary/20"
              />
              <div>
                <span className="font-display font-bold text-foreground text-lg">AllySphere</span>
                <p className="text-xs text-muted-foreground max-w-xs">
                  An Alumni Association Platform connecting students, teachers, and alumni under one umbrella.
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center gap-3 md:items-end">
              <p className="text-sm font-medium text-foreground">Connect</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AllySphere. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
