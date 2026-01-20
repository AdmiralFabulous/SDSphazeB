# Style Images

This directory contains images for lapel styles used in the StyleSelector component.

## Image Requirements

- **Format:** JPG or PNG
- **Dimensions:** Minimum 400x400px, preferably 600x600px
- **Aspect Ratio:** Square (1:1) recommended
- **File Size:** Optimized to < 100KB

## Expected Images

Place the following images in this directory:

1. **lapel-notch.jpg** - Notch lapel style showcase
2. **lapel-peak.jpg** - Peak lapel style showcase
3. **lapel-shawl.jpg** - Shawl lapel style showcase

## Usage

Images are referenced in `prisma/seed.ts` and displayed in the `StyleSelector` component. The component loads images from these URLs:
- `/images/styles/lapel-notch.jpg`
- `/images/styles/lapel-peak.jpg`
- `/images/styles/lapel-shawl.jpg`

## Adding New Images

1. Place the image file in this directory
2. Update the `imageUrl` field in `prisma/seed.ts`
3. Re-run the seed script: `npm run prisma:seed`
