# FAQ Component System

A robust, atomic-design FAQ system for withme.travel, supporting dynamic structured data (schema.org FAQPage), multiple layouts, filtering, and Storybook documentation.

---

## ✨ Features
- **Atomic Design**: Atoms, molecules, organisms, and variants for maximum flexibility
- **Dynamic Structured Data**: Outputs schema.org FAQPage JSON-LD for SEO, always matching visible content
- **Multiple Layouts**: Default, sidebar, grid, compact, and inline
- **Filtering**: Tag and search filter UI
- **TypeScript**: Fully typed, with extensible interfaces
- **Storybook**: Stories for every atomic level and variant
- **Dark Mode**: Fully themeable
- **Accessible**: Keyboard and screen reader friendly

---

## 📁 File Structure

```
components/faq/
  atoms/         # FAQQuestion, FAQAnswer, FAQTag (+ stories)
  molecules/     # FAQItem, FAQList, FAQFilter (+ stories)
  organisms/     # FAQ (main component, + stories)
  variants/      # DestinationsFAQ, TripPlanningFAQ (+ stories)
  index.ts       # Barrel export
  README.md      # This file
```

---

## 🧩 Atomic Design

- **Atoms**: Smallest units (question, answer, tag)
- **Molecules**: Combinations (FAQItem = question + answer + accordion)
- **Organisms**: Full FAQ section with filtering, layout, and structured data
- **Variants**: Pre-configured for site contexts (e.g., DestinationsFAQ)

---

## 🚀 Usage

### Importing
```tsx
import { FAQ, DestinationsFAQ, TripPlanningFAQ } from '@/components/faq';
```

### Basic Example
```tsx
<FAQ
  items={[
    { question: 'How do I create a trip?', answer: 'Click "Create Trip" on your dashboard.' },
    { question: 'Is my data private?', answer: 'Yes, we never share your data.' },
  ]}
  title="Frequently Asked Questions"
/>
```

### With Filtering and Custom Layout
```tsx
<FAQ
  items={faqEntries}
  layout="sidebar"
  showFilter={true}
  showSearch={true}
  allowHtml={true}
/>
```

### Contextual Variant
```tsx
<DestinationsFAQ />
<TripPlanningFAQ />
```

---

## 🔎 Structured Data (SEO)
- The `FAQ` organism outputs a `<script type="application/ld+json">` block with schema.org FAQPage data.
- This is always generated from the current `items` prop (including custom/filtered/variant content).
- Disable with `structuredData={false}` if needed.
- HTML in answers is stripped for structured data.

---

## 🧪 Storybook
- Every atom, molecule, organism, and variant has a Storybook story.
- Stories demonstrate all layouts, filtering, and structured data options.
- Stories for grid, sidebar, compact, and custom FAQ content.
- See `*.stories.tsx` files in each subfolder.

---

## 🛠️ Customization
- **Add new variants**: Create a new file in `variants/` and pass your own FAQ entries.
- **Add new layouts**: Extend the `FaqLayout` type and update the `FAQ` organism.
- **Add new filter logic**: Extend the `FAQFilter` molecule.
- **Add more metadata**: Extend the `FaqEntry` type and update the structured data helper.

---

## 📝 Types
- `FaqEntry`: `{ question: string; answer: string; id?: string; tags?: string[] }`
- `FaqLayout`: `'default' | 'sidebar' | 'inline' | 'grid' | 'compact'`
- `FaqFilterParams`: `{ search?: string; tags?: string[]; limit?: number }`

---

## 🧑‍💻 Example: Custom Variant
```tsx
import { FAQ } from '@/components/faq';

const customFaqs = [
  { question: 'How do I reset my password?', answer: 'Click "Forgot password" on the login page.' },
  { question: 'Is my data private?', answer: 'Yes, we never share your data.' },
];

<FAQ
  items={customFaqs}
  title="Account & Privacy FAQ"
  layout="grid"
  showFilter={false}
/>
```

---

## 🧩 Atoms, Molecules, Organisms, Variants
- **Atoms**: `FAQQuestion`, `FAQAnswer`, `FAQTag`
- **Molecules**: `FAQItem`, `FAQList`, `FAQFilter`
- **Organisms**: `FAQ`
- **Variants**: `DestinationsFAQ`, `TripPlanningFAQ`

---

## 🏷️ Tags & Filtering
- Add `tags` to your FAQ entries for filtering.
- The filter UI appears if there are tags and `showFilter` is true.

---

## 🧑‍🔬 Testing
- All components are covered by Storybook stories.
- Test different layouts, filtering, and structured data in Storybook.

---

## 📚 See Also
- [Storybook stories in each subfolder](./)
- [FAQ types](../../types/faq.ts)

---

## 🏁 Summary
- Drop-in, SEO-friendly, atomic FAQ system for any page or context.
- Fully dynamic, always up-to-date structured data.
- Easy to extend, theme, and test. 