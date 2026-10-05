// Asset map with per-image focal points (DESIGN §6.2). Focal points keep crops
// on the subject across formats.

export interface AssetMeta {
  /** Path relative to public/ (served via staticFile). */
  file: string
  focusX: number
  focusY: number
}

export const ASSETS = {
  studioNight: { file: 'media/studio-night.jpg', focusX: 0.52, focusY: 0.42 },
  appsCode: { file: 'media/service-applications.jpg', focusX: 0.5, focusY: 0.45 },
  websites: { file: 'media/service-websites.jpg', focusX: 0.55, focusY: 0.5 },
  servers: { file: 'media/infrastructure-servers.jpg', focusX: 0.5, focusY: 0.55 },
  network: { file: 'media/engineer-network.jpg', focusX: 0.55, focusY: 0.52 },
  datacenter: { file: 'media/datacenter-monitor.jpg', focusX: 0.5, focusY: 0.48 },
  controlPanel: { file: 'media/control-panel.jpg', focusX: 0.5, focusY: 0.38 },
  itSupport: { file: 'media/it-support.jpg', focusX: 0.5, focusY: 0.5 },
  circuit: { file: 'media/circuit-macro.jpg', focusX: 0.5, focusY: 0.5 },
  textureNetwork: { file: 'media/texture-network.jpg', focusX: 0.5, focusY: 0.5 },
  mobileBlank: { file: 'media/mobile-blank.jpg', focusX: 0.5, focusY: 0.5 },
  arc: { file: 'projects/arc-glasshouse-reference.jpg', focusX: 0.5, focusY: 0.5 },
  ingcebo: { file: 'projects/ingcebo-reference.jpg', focusX: 0.5, focusY: 0.5 },
  spartcon: { file: 'projects/spartcon-reference.jpg', focusX: 0.5, focusY: 0.5 },
} as const satisfies Record<string, AssetMeta>

export type AssetKey = keyof typeof ASSETS

/** Resolve an asset, throwing on an unknown key or an out-of-range focal point. */
export function getAsset(key: AssetKey): AssetMeta {
  const meta = ASSETS[key]
  if (!meta) {
    throw new Error(`Unknown asset key: ${String(key)}`)
  }
  if (meta.focusX < 0 || meta.focusX > 1 || meta.focusY < 0 || meta.focusY > 1) {
    throw new RangeError(
      `Asset "${key}": focal point out of range (${meta.focusX}, ${meta.focusY})`,
    )
  }
  return meta
}
