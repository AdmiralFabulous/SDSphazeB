# Preview Endpoint Testing Guide

## Endpoint
`GET /api/configs/:id/preview`

## Test Setup

### 1. Create Test Data

First, seed the database with test fabric and configuration:

```typescript
// You can run this in a seed script or manually via Prisma Studio
const fabric = await prisma.fabric.create({
  data: {
    code: 'RAY-NVY-001',
    name: 'Navy Rayburn Wool',
    description: 'Premium navy wool fabric',
    colorHex: '#1a1a2e',
    textureUrl: 'https://cdn.suitai.com/fabrics/RAY-NVY-001',
    thumbnailUrl: 'https://cdn.suitai.com/fabrics/RAY-NVY-001/thumb.jpg',
    priceModifier: 1.2,
    basePriceGbp: 450.00,
    inStock: true,
    stockQuantity: 100,
    isActive: true,
  }
});

const config = await prisma.suitConfig.create({
  data: {
    fabricId: fabric.id,
    styleJson: JSON.stringify({
      jacket: {
        lapel: 'peak',
        buttons: 2,
        vents: 'double',
        lining_color: '#8b0000'
      },
      trousers: {
        fit: 'slim',
        pleats: 'flat'
      },
      vest: {
        included: true,
        buttons: 5
      }
    })
  }
});

console.log('Config ID:', config.id);
```

### 2. Test the Endpoint

```bash
# Replace {configId} with the actual ID from step 1
curl http://localhost:3000/api/configs/{configId}/preview
```

### 3. Expected Response

```json
{
  "configId": "clxxx...",
  "textures": {
    "baseUrl": "https://cdn.suitai.com/fabrics/RAY-NVY-001",
    "diffuse": "https://cdn.suitai.com/fabrics/RAY-NVY-001/diffuse.jpg",
    "normal": "https://cdn.suitai.com/fabrics/RAY-NVY-001/normal.jpg",
    "roughness": "https://cdn.suitai.com/fabrics/RAY-NVY-001/roughness.jpg",
    "ao": "https://cdn.suitai.com/fabrics/RAY-NVY-001/ao.jpg"
  },
  "meshes": {
    "jacket": "jacket_peak_2btn_doublevent.glb",
    "trousers": "trousers_slim_flat.glb",
    "vest": "vest_5btn.glb"
  },
  "materials": {
    "fabricColor": "#1a1a2e",
    "liningColor": "#8b0000",
    "buttonMetal": "brass"
  },
  "scene": {
    "environment": "studio",
    "lightingPreset": "product"
  }
}
```

### 4. Error Cases

**Config Not Found (404):**
```bash
curl http://localhost:3000/api/configs/invalid-id/preview
```

Expected response:
```json
{
  "error": "Configuration not found"
}
```

## Mesh Variant Logic

The endpoint generates mesh file names based on style options:

### Jacket Variants
- Lapel: `notch` (default), `peak`, `shawl`
- Buttons: `1`, `2` (default), `3`
- Vents: `none`, `single`, `double` (default)
- Pattern: `jacket_{lapel}_{buttons}btn_{vents}vent.glb`
- Example: `jacket_peak_2btn_doublevent.glb`

### Trousers Variants
- Fit: `slim` (default), `regular`, `relaxed`
- Pleats: `flat` (default), `single`, `double`
- Pattern: `trousers_{fit}_{pleats}.glb`
- Example: `trousers_slim_flat.glb`

### Vest Variants (optional)
- Buttons: `5` (default), `6`
- Pattern: `vest_{buttons}btn.glb`
- Example: `vest_5btn.glb`
- Note: Returns `null` if `vest.included` is `false`

## Implementation Files

- **Route Handler:** `src/app/api/configs/[id]/preview/route.ts`
- **Type Definitions:** `src/types/preview.ts`
- **Database Schema:** `prisma/schema.prisma`

## Database Schema

### Fabric Model
```prisma
model Fabric {
  id              String        @id @default(cuid())
  code            String        @unique
  name            String
  textureUrl      String?       @map("texture_url")
  colorHex        String?       @map("color_hex")
  // ... other fields
}
```

### SuitConfig Model
```prisma
model SuitConfig {
  id         String   @id @default(cuid())
  fabricId   String   @map("fabric_id")
  styleJson  String   @map("style_json") // JSON string
  fabric     Fabric   @relation(fields: [fabricId], references: [id])
}
```
