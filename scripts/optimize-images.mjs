// Turns the full-size files in media/originals into web-sized .webp files in
// public/images. Run with `npm run images` after adding or replacing a photo.
import { mkdir, readdir } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'media/originals'
const OUT = 'public/images'
const MAX_WIDTH = 2200
const FORMATS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])

await mkdir(OUT, { recursive: true })

for (const file of await readdir(SRC)) {
  if (!FORMATS.has(extname(file).toLowerCase())) continue
  const out = join(OUT, `${parse(file).name}.webp`)
  const info = await sharp(join(SRC, file), { limitInputPixels: false })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out)
  console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}
