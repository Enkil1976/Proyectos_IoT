import { expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vitest-canvas-mock'

// Mock CSS imports
vi.mock('*.css', () => ({
  default: '.mock-css { color: inherit }'
}))
vi.mock('*.scss', () => ({
  default: '.mock-scss { color: inherit }'
}))
vi.mock('vuetify/lib/styles/main.sass', () => ({}))

const vuetify = createVuetify({
  components,
  directives,
})

// Mock browser APIs
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.CSS = { 
  supports: () => false,
  escape: (str) => str
}

global.vuetify = vuetify

// Mock canvas
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({}),
  putImageData: () => {},
  createImageData: () => ({}),
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
})
