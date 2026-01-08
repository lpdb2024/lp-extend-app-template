export class SVGPositionDB {
  group_id: string | null
  x1: number
  y1: number
  x2: number
  y2: number
  angle: number
  cx: number
  cy: number
  tl: { x: number, y: number }
  tr: { x: number, y: number }
  bl: { x: number, y: number }
  br: { x: number, y: number }
  skewX: number
  skewY: number
  scaleX: number
  scaleY: number
  flipX: boolean
  flipY: boolean
  originX: string
  originY: string
  constructor (x1: number, y1: number, x2: number, y2: number, angle: number, groupId?: string) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.angle = angle
    this.cx = x1 + (x2 - x1) / 2
    this.cy = y1 + (y2 - y1) / 2
    this.tl = { x: x1, y: y1 }
    this.tr = { x: x2, y: y1 }
    this.bl = { x: x1, y: y2 }
    this.br = { x: x2, y: y2 }
    this.skewX = 0
    this.skewY = 0
    this.scaleX = 1
    this.scaleY = 1
    this.flipX = false
    this.flipY = false
    this.originX = 'left'
    this.originY = 'top'
    this.group_id = groupId || null
  }
}

export class SVGStyle {
  fill: string
  stroke: string
  strokeWidth: number
  strokeDashOffset: number
  strokeLineCap: string
  strokeDashArray: string
  strokeLineJoin: string
  strokeMiterLimit: number
  fillRule: string
  paintFirst: string
  globalCompositeOperation: string
  constructor (fill: string, stroke: string, strokeWidth: number) {
    this.fill = fill
    this.stroke = stroke
    this.strokeWidth = strokeWidth
    this.strokeDashOffset = 0
    this.strokeLineCap = 'butt'
    this.strokeDashArray = ''
    this.strokeLineJoin = 'miter'
    this.strokeMiterLimit = 4
    this.fillRule = 'nonzero'
    this.paintFirst = 'fill'
    this.globalCompositeOperation = 'source-over'
  }
}

class SVGElementDB {
  id: string
  groupId: string | null
  left: number
  top: number
  width: number
  height: number
  angle: number
  type: string

  constructor (id: string, groupId: string | null, left: number, top: number, width: number, height: number, angle: number, type: string) {
    Object.assign(this, new SVGPositionDB(left, top, left + width, top + height, angle, groupId || undefined))
    Object.assign(this, new SVGStyle('', '', 0))
    this.id = id
    this.type = type
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    this.angle = angle
    this.groupId = groupId
  }
}

export class SVGRect extends SVGElementDB {
  path: string
  constructor (
    id: string,
    groupId: string | null,
    left: number,
    top: number,
    width: number,
    height: number,
    angle: number,
    fill: string,
    stroke: string,
    strokeWidth: number
  ) {
    super(id, groupId, left, top, width, height, angle, 'rect')
    Object.assign(this, new SVGStyle(fill, stroke, strokeWidth))
    this.path = `M${left} ${top} L${left + width} ${top} L${left + width} ${top + height} L${left} ${top + height} Z`
  }
}

export class SVGImage extends SVGElementDB {
  href: string
  constructor (id: string, groupId: string | null, left: number, top: number, width: number, height: number, angle: number, href: string) {
    super(id, groupId, left, top, width, height, angle, 'image')
    this.href = href
  }
}

export class SVGPath extends SVGElementDB {
  path: string
  constructor (
    id: string,
    groupId: string | null,
    left: number,
    top: number,
    width: number,
    height: number,
    angle: number,
    fill: string,
    stroke: string,
    strokeWidth: number,
    path: string
  ) {
    super(id, groupId, left, top, width, height, angle, 'path')
    this.path = path
    Object.assign(this, new SVGStyle(fill, stroke, strokeWidth))
  }
}
