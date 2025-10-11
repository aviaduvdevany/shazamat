# Shazamat Components Architecture

This document describes the component structure and organization for the Shazamat website.

## 📁 Folder Structure

```
src/components/
├── layout/           # Layout components (Header, Footer)
├── sections/         # Page sections (Hero, About, Shows, etc.)
├── ui/              # Reusable UI components (Buttons, Cards, Forms)
└── README.md        # This file
```

## 🎯 Design Principles

1. **Modularity**: Each component is self-contained and reusable
2. **Single Responsibility**: Each component has one clear purpose
3. **Type Safety**: TypeScript interfaces for all props
4. **Accessibility**: WCAG AA compliance with proper ARIA labels
5. **Performance**: Optimized rendering and lazy loading where appropriate

## 📦 Component Categories

### Layout Components (`/layout`)

Components that define the overall page structure and appear on every page.

- **Header.tsx**: Main navigation bar with mobile menu support
- **Footer.tsx**: Site footer with links and contact info

### Section Components (`/sections`)

Large, feature-specific sections that compose the homepage.

- **Hero.tsx**: Main hero section with CTA buttons
- **About.tsx**: Band information and story
- **Shows.tsx**: Upcoming shows/events listing
- **Music.tsx**: Music releases and streaming links
- **EnergyBanner.tsx**: Promotional banner with brand messaging
- **Gallery.tsx**: Photo gallery from performances
- **Contact.tsx**: Newsletter signup and social links

### UI Components (`/ui`)

Small, reusable components used throughout the application.

- **AlbumCard.tsx**: Individual album/release card
- **ShowCard.tsx**: Individual show/event card
- **GalleryItem.tsx**: Single gallery image item
- **NewsletterForm.tsx**: Email subscription form
- **SocialLinks.tsx**: Social media icon links
- **StreamingPlatforms.tsx**: Music platform buttons
- **button.tsx**: Base button component (from shadcn/ui)
- **navigation-menu.tsx**: Navigation component (from shadcn/ui)

## 🔄 Data Flow

### Static Data

Currently, data is defined within components (e.g., `upcomingShows` in Shows.tsx).

### Future: Dynamic Data

For production, move data to:

- `/src/data/` - JSON or TypeScript constants
- API routes in `/src/app/api/`
- External CMS (Contentful, Sanity, etc.)
- Database with Prisma/Drizzle

## 🎨 Styling

- **CSS Variables**: Brand tokens defined in `globals.css`
- **Tailwind CSS**: Utility-first styling
- **RTL Support**: Full right-to-left layout for Hebrew
- **Responsive**: Mobile-first approach with breakpoints

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states with orange accent
- Reduced motion support via `prefers-reduced-motion`

## 🚀 Usage Examples

### Using a Section Component

```tsx
import Hero from "@/components/sections/Hero";

export default function Page() {
  return <Hero />;
}
```

### Using a UI Component with Props

```tsx
import ShowCard from "@/components/ui/ShowCard";

const show = {
  day: "15",
  month: "נוב",
  city: "תל אביב",
  venue: "קונטיינר, נמל תל אביב",
};

<ShowCard {...show} />;
```

## 🔮 Future Enhancements

1. **State Management**: Add Zustand/Redux for complex state
2. **Animations**: Integrate Framer Motion for advanced animations
3. **Image Optimization**: Use Next.js Image component
4. **Internationalization**: Add i18n support (Hebrew + English)
5. **Testing**: Add Jest + React Testing Library
6. **Storybook**: Component documentation and visual testing
7. **Analytics**: Integrate event tracking
8. **Performance Monitoring**: Add Web Vitals tracking

## 📝 Contributing

When adding new components:

1. Follow the existing folder structure
2. Add TypeScript interfaces for all props
3. Include JSDoc comments for complex logic
4. Test on mobile and desktop
5. Ensure RTL layout works correctly
6. Verify accessibility with keyboard navigation
7. Update this README if adding new categories

## 🎵 Brand Guidelines

All components follow the Shazamat brand guidelines:

- Colors: Black (#000000), White (#FFFFFF), Orange (#DB7738)
- Typography: System fonts with Hebrew support
- Motion: Smooth transitions (120ms-320ms)
- Spacing: Consistent scale (4px-64px)

See `design.json` for complete brand specifications.
