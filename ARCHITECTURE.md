# Shazamat Website - Architecture Documentation

## 🏗️ Visual Component Hierarchy

```
Page (src/app/page.tsx)
│
├── Header (Fixed Navigation)
│   ├── Logo
│   ├── Desktop Menu
│   └── Mobile Menu Toggle
│
├── Hero Section
│   ├── Background Effects
│   ├── Title (Hebrew + English)
│   ├── Tagline
│   ├── CTA Buttons (2)
│   └── Scroll Indicator
│
├── About Section
│   ├── Heading
│   ├── Story Text (3 paragraphs)
│   └── Visual Element (with orange accent)
│
├── Shows Section
│   └── ShowCard (×3)
│       ├── Date Badge
│       ├── City & Venue
│       └── CTA Button
│
├── Music Section
│   ├── AlbumCard (×3)
│   │   ├── Album Cover (with hover play button)
│   │   ├── Title
│   │   └── Year
│   └── StreamingPlatforms
│       └── Platform Buttons (×4)
│
├── EnergyBanner
│   └── Bold Statement Text
│
├── Gallery Section
│   └── GalleryItem (×8)
│       └── Image Placeholder (with hover effect)
│
├── Contact Section
│   ├── Heading
│   ├── Description
│   ├── NewsletterForm
│   │   ├── Email Input
│   │   └── Submit Button
│   └── SocialLinks
│       └── Social Icon Buttons (×4)
│
└── Footer
    ├── About Column
    ├── Quick Links Column
    ├── Contact Column
    └── Copyright
```

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│                     (Components)                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ imports
                   ▼
┌─────────────────────────────────────────────────────┐
│                   Data Layer                         │
│                    (/src/data/)                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ shows.ts │  │ music.ts │  │social.ts │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│              └──> index.ts (exports)                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ typed by
                   ▼
┌─────────────────────────────────────────────────────┐
│               Type Definitions                       │
│                  (/src/types/)                       │
│                                                      │
│  Show, Album, SocialPlatform, etc.                  │
└─────────────────────────────────────────────────────┘
```

## 🎨 Styling Architecture

```
┌─────────────────────────────────────────────────────┐
│            globals.css (Brand Tokens)                │
│                                                      │
│  CSS Variables → Brand Colors, Spacing, etc.        │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ applied via
                   ▼
┌─────────────────────────────────────────────────────┐
│              Tailwind CSS Utilities                  │
│                                                      │
│  className="bg-[var(--shazamat-orange)]"            │
│  className="p-[var(--spacing-lg)]"                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ renders to
                   ▼
┌─────────────────────────────────────────────────────┐
│                  Final Output                        │
│              (Browser Rendering)                     │
└─────────────────────────────────────────────────────┘
```

## 🔄 Component Import Strategy

### Current Structure (Clean Imports)

```typescript
// ✅ GOOD - Centralized imports
import { Header, Footer, Hero } from "@/components";
import { albums, upcomingShows } from "@/data";
import type { Show, Album } from "@/types";
```

### Old Structure (Before Refactor)

```typescript
// ❌ AVOID - Verbose imports
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
```

## 📁 File Responsibility Matrix

| File/Folder                | Responsibility          | Can Be Modified By | Frequency of Changes |
| -------------------------- | ----------------------- | ------------------ | -------------------- |
| `src/app/page.tsx`         | Homepage composition    | Developer          | Low                  |
| `src/components/sections/` | Section layouts         | Developer/Designer | Medium               |
| `src/components/ui/`       | Reusable UI elements    | Developer          | Low                  |
| `src/data/`                | Content (shows, albums) | Content Manager    | High                 |
| `src/types/`               | TypeScript interfaces   | Developer          | Low                  |
| `src/app/globals.css`      | Brand tokens            | Designer           | Very Low             |

## 🎯 Component Design Patterns

### 1. Section Components (Container Pattern)

```tsx
export default function SectionName() {
  return (
    <section id="section-id" className="py-24 bg-white">
      <div className="container-custom">{/* Content */}</div>
    </section>
  );
}
```

### 2. UI Components (Props-Based Pattern)

```tsx
interface ComponentProps {
  title: string;
  // ... other props
}

export default function ComponentName({ title }: ComponentProps) {
  return <div>{title}</div>;
}
```

### 3. Data-Driven Components

```tsx
import { dataArray } from "@/data";

export default function ListSection() {
  return (
    <section>
      {dataArray.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </section>
  );
}
```

## 🚀 Performance Optimization Strategy

### Current Implementation

- ✅ Static rendering (Next.js default)
- ✅ CSS-in-JS avoided (Tailwind + CSS variables)
- ✅ No unnecessary re-renders
- ✅ Minimal JavaScript

### Future Optimizations

- 🔄 Image optimization with Next.js Image
- 🔄 Code splitting for large sections
- 🔄 Lazy loading for below-the-fold content
- 🔄 Web font optimization

## 🌐 Internationalization Ready

```
src/
├── i18n/
│   ├── locales/
│   │   ├── he.json    # Hebrew (current)
│   │   └── en.json    # English (future)
│   └── config.ts
```

## 🔐 Security Considerations

- ✅ No sensitive data in client-side code
- ✅ Email validation in forms
- ✅ XSS protection via React
- 🔄 Rate limiting on API routes (future)
- 🔄 CSRF protection (future)

## 📈 Scalability Path

### Phase 1: Current (Static Site)

- Static data in `/data/` folder
- Client-side only
- Fast and simple

### Phase 2: API Integration (Next)

```
src/
├── app/
│   └── api/
│       ├── shows/
│       ├── newsletter/
│       └── contact/
```

### Phase 3: CMS Integration (Future)

- Headless CMS (Sanity/Contentful)
- Real-time content updates
- Preview mode

### Phase 4: Full Application (Advanced)

- User authentication
- Admin dashboard
- Analytics integration
- E-commerce (merch)

## 🧪 Testing Strategy (Future)

```
src/
├── __tests__/
│   ├── components/
│   ├── integration/
│   └── e2e/
```

**Recommended Tools:**

- Unit: Jest + React Testing Library
- E2E: Playwright or Cypress
- Visual: Chromatic or Percy

## 📊 Monitoring & Analytics (Future)

```typescript
// Analytics integration points
- Page views
- CTA clicks
- Form submissions
- Show card clicks
- Album plays
- Social media clicks
```

## 🎓 Learning Resources

For developers working on this project:

1. **Next.js App Router**: [nextjs.org/docs](https://nextjs.org/docs)
2. **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org)
3. **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
4. **React Best Practices**: [react.dev](https://react.dev)
5. **Accessibility**: [web.dev/accessibility](https://web.dev/accessibility)

## 🔧 Maintenance Guidelines

### Weekly

- Check for broken links
- Update show dates
- Monitor form submissions

### Monthly

- Review analytics
- Update dependencies
- Performance audit

### Quarterly

- Design review
- Content strategy review
- SEO optimization

---

**Last Updated**: October 2024  
**Maintained By**: Shazamat Development Team  
**Version**: 1.0.0
