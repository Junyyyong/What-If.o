# AX ARCHIVE - Character Directory

A high-density, minimalist character directory inspired by `jetset.nl`.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## How to Add Your Characters

All character data is stored in `src/data/characters.ts`.

### Modifying the Data
Open `src/data/characters.ts` and update the `characters` array.

```typescript
export const characters: Character[] = [
  {
    id: "AX-001",
    name: "My Character Name",
    category: "Legendary", // Must match one of the categories
    image: "/path/to/your/image.png"
  },
  // Add more characters here...
];
```

### Adding Images
Place your character images in the `public/` folder or a subfolder within it. You can then reference them using absolute paths in the `image` field (e.g., `/characters/hero.png`).

### Customizing Categories
You can update the `categories` array in `src/data/characters.ts` to add or remove filtering options.

```typescript
export const categories = ['All', 'Legendary', 'Rare', 'Common', 'Special'];
```

## Tech Stack
- **Vite**: Ultra-fast build tool.
- **React**: Component-based UI.
- **Framer Motion**: Smooth entry and layout animations.
- **Lucide React**: Clean, minimalist icons.
- **Vanilla CSS**: Custom-built design system in `src/index.css`.
