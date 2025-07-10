import { useEffect } from 'react';

/**
 * Hook to set security headers and meta tags for enhanced security
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set Content Security Policy via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://discord.com https://*.discord.com",
      "frame-src 'self' https://js.stripe.com https://discord.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    document.head.appendChild(cspMeta);
    
    // Set other security headers via meta tags
    const securityHeaders = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];
    
    const metaTags: HTMLMetaElement[] = [];
    
    securityHeaders.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.httpEquiv;
      meta.content = header.content;
      document.head.appendChild(meta);
      metaTags.push(meta);
    });
    
    // Add CSRF token meta tag
    const csrfMeta = document.createElement('meta');
    csrfMeta.name = 'csrf-token';
    csrfMeta.content = generateCSRFToken();
    document.head.appendChild(csrfMeta);
    metaTags.push(csrfMeta);
    
    // Cleanup function
    return () => {
      try {
        document.head.removeChild(cspMeta);
        metaTags.forEach(tag => {
          if (document.head.contains(tag)) {
            document.head.removeChild(tag);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up security headers:', error);
      }
    };
  }, []);
};

// Generate CSRF token
const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};