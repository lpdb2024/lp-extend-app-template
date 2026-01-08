// import { useNotifyStore } from 'src/stores/notify'

// import {
//   COLORS,
//   ROLES,
//   ROUTE_NAMES
// } from '@/constants/constants'
import { customAlphabet } from 'nanoid'

const alpha = 'abcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(`1234567890${alpha}${alpha.toUpperCase()}`, 22)

export class HelperService {
  aggregateEntriesValues<T> (
    item: Record<string | number, T>,
    multiplier = 1
  ) {
    const values = Object.entries(item)
      .map(([, val]) => val)
      .filter(Number) as number[]
    return (values.reduce((a, c) => a + c, 0) * multiplier) / values.length
  }

  findAllVars (str: string) {
    console.info(str)
    const found = []
    const rxp = /{{([^}]+)}}/g
    let curMatch: RegExpExecArray | null
    while ((curMatch = rxp.exec(str))) {
      found.push(curMatch[1])
    }
    console.info(found)
    return found
  }

  // findAllowedRoute (routes: { name: ROUTE_NAMES; allowedRoles: ROLES[] }[]) {
  //   const { hasRole } = useUserStore()
  //   const firstAllowedRoute = routes.find((route) =>
  //     hasRole(route.allowedRoles)
  //   )
  //   return firstAllowedRoute?.name
  // }

  // getColors (ids: string[]) {
  //   let index = 0
  //   const colors = new Map<string, IColor>()
  //   ids.forEach((id, idx) => {
  //     if (index > idx) index = 0
  //     colors.set(id, COLORS[index])
  //     index++
  //   })
  //   return colors
  // }

  convertPathToFile (path: string) {
    const filenameParts = path.split('/')
    return filenameParts[filenameParts.length - 1] ?? path
  }

  uuid (size?: number) {
    return nanoid(size)
  }

  scrollToLatest (refs: Array<{ $el: HTMLElement }>) {
    if (refs.length) {
      const newMessage = refs[refs.length - 1]
      if (newMessage) {
        const element = newMessage.$el
        element.parentElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }
}

export default new HelperService()
