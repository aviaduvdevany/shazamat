/**
 * Common Types and Interfaces for Shazamat Website
 */

// Show/Event Types
export interface Show {
  id: number;
  date: string; // ISO date string (YYYY-MM-DD)
  city: string;
  venue: string;
  ticketLink?: string;
}

// Music/Album Types
export interface Album {
  id: number;
  title: string;
  year: string;
  subtitle?: string;
  coverImage?: string;
  spotify?: string;
  appleMusic?: string;
}

// Social Media Types
export interface SocialPlatform {
  name: string;
  icon: string;
  url: string;
}

// Gallery Types
export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  thumbnail?: string;
}

// Newsletter Types
export interface NewsletterSubscription {
  email: string;
  timestamp?: Date;
}

// Contact Types
export interface ContactInfo {
  email: string;
  bookingEmail: string;
  phone: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
