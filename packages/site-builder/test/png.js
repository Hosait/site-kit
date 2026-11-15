// Test images for qc: white PNGs with dark rectangles.
import { PNG } from 'pngjs'

/** A white PNG with dark rectangles: [{ y, h, x = 0, w = width }]. */
export function png(width, height, rects = []) {
  const img = new PNG({ width, height })
  img.data.fill(255)
  for (const { y, h, x = 0, w = width } of rects)
    for (let yy = y; yy < Math.min(y + h, height); yy++)
      for (let xx = x; xx < Math.min(x + w, width); xx++) {
        const i = (yy * width + xx) * 4
        img.data[i] = 20; img.data[i + 1] = 33; img.data[i + 2] = 61
      }
  return PNG.sync.write(img)
}
