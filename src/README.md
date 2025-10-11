# Shazamat Website - Source Code Documentation

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with RTL support
│   ├── page.tsx           # Homepage (main entry point)
│   ├── globals.css        # Global styles and brand tokens
│   └── favicon.ico        # Site favicon
│
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── sections/         # Page sections (Hero, About, etc.)
│   ├── ui/              # Reusable UI components
│   ├── index.ts         # Centralized component exports
│   └── README.md        # Component documentation
│
├── data/                 # Static data and content
│   ├── shows.ts         # Upcoming shows data
│   ├── music.ts         # Albums and streaming platforms
│   ├── social.ts        # Social media links
│   └── index.ts         # Centralized data exports
│
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
│
├── lib/                # Utilities and helper functions
│   └── utils.ts       # Utility functions
│
└── README.md          # This file
```

## 🎯 Architecture Overview

### Component Organization

**Layout Components** (`/components/layout/`)

- Persistent UI elements that appear on every page
- Header with navigation and mobile menu
- Footer with contact info and links

**Section Components** (`/components/sections/`)

- Large, feature-specific page sections
- Each section is self-contained and focused
- Easy to reorder or remove sections

**UI Components** (`/components/ui/`)

- Small, reusable building blocks
- Can be used across different sections
- Atomic design principles

### Data Management

All static data is centralized in `/src/data/`:

- Easy to update content without touching components
- Type-safe with TypeScript interfaces
- Ready to migrate to API/CMS when needed

### Type Safety

TypeScript types in `/src/types/`:

- Shared interfaces for props and data
- Compile-time error checking
- Better IDE autocomplete and intellisense

## 🚀 Quick Start

### Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## 📝 Common Tasks

### Adding a New Show

Edit `src/data/shows.ts`:

```typescript
export const upcomingShows: Show[] = [
  {
    id: 4,
    day: "12",
    month: "דצמ",
    city: "באר שבע",
    venue: "קאנטרי, באר שבע",
    ticketLink: "https://...",
  },
  // ... existing shows
];
```

### Adding a New Album

Edit `src/data/music.ts`:

```typescript
export const albums: Album[] = [
  {
    id: 4,
    title: "האלבום החדש",
    year: "2025",
    coverImage: "/images/album-4.jpg", // optional
  },
  // ... existing albums
];
```

### Updating Social Links

Edit `src/data/social.ts`:

```typescript
export const socialPlatforms: SocialPlatform[] = [
  { name: "Instagram", icon: "i", url: "https://instagram.com/shazamat" },
  // ... update URLs
];
```

### Adding a New Section

1. Create component in `src/components/sections/NewSection.tsx`
2. Export it in `src/components/index.ts`
3. Import and use in `src/app/page.tsx`

```tsx
// NewSection.tsx
export default function NewSection() {
  return <section className="py-24">{/* Your content */}</section>;
}

// page.tsx
import { NewSection } from "@/components";

<NewSection />;
```

## 🎨 Styling Guidelines

### Using Brand Tokens

CSS variables are defined in `globals.css`:

```css
/* Colors */
var(--shazamat-white)
var(--shazamat-black)
var(--shazamat-orange)

/* Spacing */
var(--spacing-xs)  /* 4px */
var(--spacing-sm)  /* 8px */
var(--spacing-md)  /* 16px */
var(--spacing-lg)  /* 24px */
var(--spacing-xl)  /* 32px */
var(--spacing-2xl) /* 48px */
var(--spacing-3xl) /* 64px */

/* Border Radius */
var(--radius-sm)   /* 6px */
var(--radius-md)   /* 10px */
var(--radius-lg)   /* 14px */

/* Motion */
var(--duration-fast)  /* 120ms */
var(--duration-base)  /* 200ms */
var(--duration-slow)  /* 320ms */
```

### Responsive Design

Mobile-first approach with Tailwind breakpoints:

```tsx
// Mobile: default
// Tablet: md: (768px+)
// Desktop: lg: (1024px+)

<div className="text-base md:text-lg lg:text-xl">Responsive text</div>
```

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states with orange accent
- RTL support for Hebrew
- `prefers-reduced-motion` respected

## 🔮 Future Enhancements

### Ready for Integration

1. **CMS Integration**

   - Replace `/data/` files with CMS API calls
   - Sanity, Contentful, or Strapi recommended

2. **Image Optimization**

   - Add real images to `/public/images/`
   - Use Next.js `<Image>` component
   - Lazy loading enabled

3. **Animations**

   - Framer Motion integration ready
   - Scroll animations
   - Page transitions

4. **Forms**

   - Newsletter API endpoint at `/api/newsletter`
   - Email service integration (SendGrid, Mailchimp)

5. **Analytics**

   - Google Analytics
   - Facebook Pixel
   - Custom event tracking

6. **Multi-language**
   - i18n setup for Hebrew/English
   - Language switcher component

## 📚 File Naming Conventions

- **Components**: PascalCase (e.g., `ShowCard.tsx`)
- **Data files**: camelCase (e.g., `shows.ts`)
- **Types**: PascalCase for interfaces (e.g., `Show`, `Album`)
- **CSS**: kebab-case for classes (e.g., `container-custom`)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui base components
- **Fonts**: System fonts + Heebo (Google Fonts)

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Brand Guidelines](../design.json)

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors

```bash
# Check TypeScript
npm run type-check
```

### Linting

```bash
# Run linter
npm run lint
```

## 📧 Support

For questions or issues, contact: dev@shazamat.co.il
