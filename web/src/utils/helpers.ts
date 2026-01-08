import type {
  baseURI,
  IDomainInfo
} from 'src/interfaces'
import { parse } from './common'

export const createDomainInfo = (baseURIs: baseURI[]): IDomainInfo => {
  if (!baseURIs || baseURIs === undefined) return { services: null, region: null, zone: null }
  const region = baseURIs.find((x: baseURI) => x?.service === 'leDataReporting')?.baseURI?.substring(0, 2) || null
  if (region) { sessionStorage.setItem('region', region) }
  const zone = baseURIs.find((x: baseURI) => x?.service === 'accountConfigReadOnly')?.baseURI?.substring(0, 2) || null
  const services: Record<string, string> = {}
  for (const baseURIObj of baseURIs) {
    services[baseURIObj?.service] = baseURIObj?.baseURI
  }
  services.proactiveHandoff = `${region}.sy.handoff.liveperson.net`
  services.convBuild = `${region}.bc-sso.liveperson.net`
  services.bcmgmt = `${region}.bc-mgmt.liveperson.net`
  services.bcintg = `${region}.bc-intg.liveperson.net`
  services.bcnlu = `${region}.bc-nlu.liveperson.net`
  services.bot = `${region}.bc-bot.liveperson.net`
  services.botPlatform = `${region}.bc-platform.liveperson.net`
  services.kb = `${region}.bc-kb.liveperson.net`
  services.context = `${region}.context.liveperson.net`
  services.recommendation = `${zone}.askmaven.liveperson.net`
  services.idp = `${region}.idp.liveperson.net`
  services.proactive = `proactive-messaging.${zone}.fs.liveperson.com`
  services.maven = `${zone}.maven.liveperson.net`

  const REDIRECT = `${location.protocol}//${location.host}/callback`
  // if (window.location.href.includes('localhost')) {
  //   REDIRECT = `${location.protocol}//${location.host}/login`
  // }
  if (zone) {
    window.sessionStorage.setItem('zone', zone)
    // this.ZONE = zone
  }

  if (zone) {
    console.info(`REDIRECT: ${REDIRECT}`)
    window.sessionStorage.setItem('REDIRECT', REDIRECT)
  }
  return {
    services,
    region,
    zone
  }
}
// import files from './files.json'
// export const createFileStructure = (files: any[]) => {
//   // console.info(files)
// }

// createFileStructure(files)


const patterns = {
  notMatched: [
    'not matched: input: ',
    'dialog starter match: pattern not matched, ',
    'not able to match any intents',
    'no matching dialog starter found for user text',
    'not matched: none of the chat message patterns matched for the specified input',
    'no intent matched user input',
    'ot matched: specified input'
  ],
  matched: [
    'dialog starter match: pattern matched',
    'matched: input:',
    'atched: wxact value match for the specified input',
    'atched dialog with intent'
  ],

  processingStatements: [
    'voking NLP processor for chat messa',
    'rocesssing interaction with name:',
    'rocesssing content of the message for undefined:',
    'rocesssing messages added via',
    'rocesssing postprocessundefined for message',
    'rocesssing messages added via ',
    'rocessing interaction with dial',
    'rocessing successful',
    'cesssing preprocessundefined javascript with me'
  ],
  errorStatements: [
    'riggernextmessage set in botcontext cannot be found',
    'cannot be found, the value is',
    'ypeerror:',
    'ferenceerr',
    'yntaxError: invalid',
    'roblem compiling javascri'
  ]
}

export const testJSON = (a: string) => {
  try {
    return JSON.parse(a)
  } catch  {
    console.error(`Error parsing JSON: ${a}`)
    return a // return original string if not valid JSON
  }
}
const contains = (string: string, value: string) => {
  return !!string.toLowerCase().includes(value)
}
const containsAll = (string: string, values: string[]) => {
  let f = true
  values.forEach((v) => {
    if (!string.toLowerCase().includes(v)) f = false
  })
  return f
}
const containsAny = (string: string, values: string[]) => {
  let f = false
  values.forEach((v) => {
    if (string.toLowerCase().includes(v)) f = true
  })
  return f
}

export const valueInArray = (val: string, array: string[]) => {
  const f = false; array.forEach((a) => { if (f) return; if (val.toLowerCase().includes(a)) { return true } }); return f
}

const isObj = (a: unknown): a is Record<string, unknown> => {
  return typeof a === 'object' && !Array.isArray(a) && a !== null
}

// const findUserPhrase = (msgL: string) => {
//   if (contains(msgL, 'matched: input:') && contains(msgL, ' with pattern')) {
//     return msgL.substring(msgL.indexOf('matched: input:') + 15, msgL.indexOf(' with pattern'))
//   }
// }

const getIntName = (str: string) => {
  const n = null
  if (contains(str, 'interaction: null,')) {
    console.log('!!!! GLOABL FUNCTION')
    if (contains(str, '__initConversation()')) {
      return 'global functions: __initConversation()'
    }
    return 'global functions'
  }
  // debug message from interaction: null, javas
  if (
    containsAll(str, ['rocesssing', 'with message']) ||
    contains(str, 'content of the message for message: ')
  ) {
    const ref = 'essage:'
    const idx = str.indexOf(ref) + 1
    return str.substring(idx + ref.length)
  }

  if (contains(str, 'interaction with name: ')) {
    const ref = 'name:'
    const idx = str.indexOf(ref) + 1
    return str.substring(idx + ref.length)
  }
  if (contains(str, 'debug message from interaction')) {
    const ref = 'interaction:'
    // const end = ','
    const idx = [str.indexOf(ref) + 1, str.indexOf(',')]
    if (idx[0] === 0 || idx[1] === -1) {
      return n
    }
    if (idx[0] !== undefined && idx[1] !== undefined && idx[0] !== -1 && idx[1] !== -1) {
      if (typeof idx[0] === 'number' && typeof idx[1] === 'number' && idx[0] !== undefined && idx[1] !== undefined) {
        if (
          typeof idx[0] === 'number' &&
          typeof idx[1] === 'number' &&
          idx[0] !== undefined &&
          idx[1] !== undefined &&
          idx[0] !== -1 &&
          idx[1] !== -1 &&
          typeof ref === 'string'
        ) {
          if (
            typeof idx[0] === 'number' &&
            typeof idx[1] === 'number' &&
            idx[0] !== undefined &&
            idx[1] !== undefined &&
            idx[0] !== -1 &&
            idx[1] !== -1 &&
            typeof ref === 'string'
          ) {
            return str.substring(idx[0] + ref.length, idx[1]).trim()
          }
          return n
        }
        return n
      }
      return n
    }
    return n
  }
  if (containsAll(str, [' interaction: ', 'conversation:'])) {
    const ref = 'interaction:'
    const end = ', conversation'
    const idx = [str.indexOf(ref) + 1, str.indexOf(end)]
    return str.substring((idx[0] ?? 0) + ref.length, (idx[1] ?? 0)).trim()
  }
  /*
  General Log Entry
Processing interaction with dialog: 9bac4147-b77e-448d-94ab-736dedf2a890, interaction: universal_22, conversation:a67f3d29-5e8d-4f5f-896f-3d4216526fef
  * */
  return n

  /*
  General Log Entry
Processsing content of the message for Message: universal_22
  */
  // __initConversation()General Log Entry
  // [ "Processsing preProcessMessage javascript with message: text_question_49" ]
}

interface LogParent {
  logMessages: string[]
}

interface LogItem {
  type: string
  key: string
  title: string
  icon: string
  message: string | string[]
  interactionName: string
  msgReplaced?: string | null | undefined
  debug?: string | null | undefined
  JSONOBJ?: string | null | undefined
  [key: string]: unknown
}

interface CurrentItem {
  logCount: number
  logs: LogItem[]
  key: number
  phrase: string
  time?: number
  [key: string]: unknown
}

export const convert = (val: LogParent[]) => {
  if (!val) return
  // let phrase: string
  console.log(val)
  const debugLogObj: { records: number; logs: CurrentItem[] } = {
    records: val.length,
    logs: []
  }
  val.forEach((LOG_PARENT: LogParent, i: number) => {
    let interactionName = ''
    const currentItem: CurrentItem = {
      logCount: 0,
      logs: [],
      key: i,
      phrase: 'n/a'
    }
    const messages = LOG_PARENT.logMessages
    currentItem.logCount = messages.length
    // console.log(messages)
    let contextWarehouseCounter = 0
    const JSONPattern = /{(.*?)}/
    LOG_PARENT.logMessages.forEach((m: string, j: number) => {
      const messageObj = JSON.parse(m)
      // console.log(messageObj)
      const { Message: msg } = messageObj
      const pattern = new RegExp(JSONPattern, 'gmi')
      const isJSON = pattern.exec(msg)
      let JSONOBJ
      if (isJSON) {
        console.info(msg)
        const jr = [msg.indexOf('{') - 1, msg.lastIndexOf('}') + 1]
        console.log(msg.substring(jr[0], jr[1]))
        if (jr[0] >= 0 && jr[0] >= 0) {
          const objTest = msg.substring(jr[0], jr[1])
          const test = testJSON(objTest) // `{${isJSON[1]}}`
          console.log(test)
          JSONOBJ = test ? JSON.stringify(test) : null
        }
      }
      // console.log(JSONOBJ)
      let msgL = msg.toLowerCase()
      if (Number(j) === 0) {
        const date = messageObj.Date
        const month = date.substring(0, date.indexOf('/'))
        const day = date.substring(date.indexOf('/') + 1, date.indexOf(' '))
        const year = new Date().getFullYear()
        const hour = date.substring(date.indexOf(' ') + 1, date.indexOf(':'))
        const minSecSub = date.substring(date.indexOf(':') + 1, date.length)
        const min = minSecSub.substring(0, minSecSub.indexOf(':'))
        const sec = minSecSub.substring(minSecSub.indexOf(':') + 1, minSecSub.length)
        const newDate = new Date(year, month - 1, day, hour, min, sec)
        const x = new Date().getTimezoneOffset() - 3 * 60 * 1000
        const y = newDate.getTime() + ((x * 60 * 1000))
        currentItem.time = y // returnDateString
      }
      // process rules
      // get user message for set of logs
      const I_N = getIntName(msgL)
      interactionName = (!!I_N && I_N !== 'null' && I_N !== null) ? I_N : interactionName
      if (interactionName) console.log(interactionName)
      // if (!phrase) {
      //   const _phrase = findUserPhrase(msgL)
      //   if (phrase) currentItem.phrase = _phrase
      // }
      // const _phrase = findUserPhrase(msgL)
      // if DISPLAY USERID
      if (contains(msgL, 'display userid')) { currentItem.phrase = 'gettting debug log...' }
      // CONTEXT STORE
      if (currentItem?.logs && contains(msgL, 'set context data for conversation scope')) {
        const obj = currentItem.logs.find((obj: { type: string }) => obj.type === 'context_warehouse')
        if (!obj) {
          currentItem.logs.push({
            type: 'context_warehouse',
            key: `${i}-${j}`,
            title: 'Context Warehouse',
            icon: 'cloud',
            message: '',
            interactionName: interactionName || ''
          })
        }
        const contextMsg = (contextWarehouseCounter === 0) ? 'set context data for conversation scope' : `set context data for conversation scope (+${contextWarehouseCounter})`
        const ObjIndex = currentItem.logs.findIndex((obj: { type: string }) => obj.type === 'context_warehouse')
        if (ObjIndex !== -1 && currentItem.logs[ObjIndex]) {
          currentItem.logs[ObjIndex].message = contextMsg
        }
        contextWarehouseCounter++
      } else if (currentItem?.logs && containsAny(msgL, patterns.notMatched)) {
        for (const pattern of patterns.notMatched) {
          if (msgL.toLowerCase().includes(pattern)) {
            const obj = currentItem.logs.find((obj: { type: string }) => obj.type === 'no_match')
            if (!obj) {
              currentItem.logs.push({
                type: 'no_match',
                key: `${i}-${j}`,
                title: 'Not matched against:',
                icon: 'error_outline',
                message: 'TBC',
                interactionName: interactionName || ''
              })
            }
            const ObjIndex = currentItem.logs.findIndex((obj: { type: string }) => obj.type === 'no_match')
            if (ObjIndex !== -1 && currentItem.logs[ObjIndex]) {
              currentItem.logs[ObjIndex].message = msgL // .push(msgL)
            }
          }
        }
      } else if (currentItem?.logs && containsAll(msgL, ['otcontext', 'debug message from'])) {
        const xaa: LogItem = {
          type: 'debugMessage',
          key: `${i}-${j}`,
          title: 'debug message:',
          icon: 'bug_report',
          message: msg,
          msgReplaced: null,
          debug: null,
          interactionName: interactionName || '',
          JSONOBJ
        }
        const dref = 'message:'
        const dmsg = msg.substring(msg.indexOf(dref) + dref.length)
        xaa.debug = dmsg
        try {
          const rDbgMsg = new RegExp(dmsg, 'gmi')
          xaa.msgReplaced = msg.replace(rDbgMsg, '')
        } catch {
          // Silent catch - error ignored
        }
        currentItem.logs.push(xaa)
      } else if (currentItem?.logs && containsAny(msgL, ['rocessing messages added via botcontext.sendmessage'])) {
        currentItem.logs.push({
          type: 'sendMessage',
          key: `${i}-${j}`,
          title: 'sendMessage:',
          icon: 'send',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && containsAny(msgL, ['intent match status'])) {
        currentItem.logs.push({
          type: 'matching',
          key: `${i}-${j}`,
          title: 'matching',
          icon: 'send',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && containsAny(msgL, patterns.matched)) {
        for (const matchedPattern of patterns.matched) {
          if (msgL.toLowerCase().includes(matchedPattern)) {
            const obj = currentItem.logs.find((obj: { type: string }) => obj.type === 'match')
            if (!obj) {
              currentItem.logs.push({
                type: 'match',
                key: `${i}-${j}`,
                title: 'Matched: ',
                icon: 'check_circle',
                message: 'TBC',
                interactionName: interactionName || ''
              })
            }
            console.info(msgL)
            const ObjIndex = currentItem.logs.findIndex((obj: { type: string }) => obj.type === 'match')
            if (ObjIndex !== -1 && currentItem.logs[ObjIndex]) {
              console.log(currentItem.logs[ObjIndex])
              currentItem.logs[ObjIndex].message = msgL
            }
          }
        }
      } else if (currentItem?.logs && containsAny(msgL, patterns.processingStatements)) {
        // console.log(`processing: ${msgL}`)
        currentItem.logs.push({
          type: 'processing',
          key: `${i}-${j}`,
          title: 'Processing...',
          icon: 'run_circle',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && containsAny(msgL, patterns.errorStatements)) {
        currentItem.logs.push({
          type: 'error',
          key: `${i}-${j}`,
          title: 'Error',
          icon: 'error_outline',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && (msgL.toLowerCase().includes('ocesssing responder webhook, loading dat') || msgL.toLowerCase().includes('aresponder url:htt'))) {
        currentItem.logs.push({
          type: 'API',
          key: `${i}-${j}`,
          title: 'API',
          icon: 'settings_input_antenna',
          message: msgL,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && isObj(msgL.substring(msgL.indexOf(':') + 1, msgL.length))) {
        // console.log(msgL)
        // JSON Object validation
        msgL = msg.replace(/:N\/A,/g, ':"N/A",')
        // (`testObj: ${JSON.stringify(msg.substring(msg.indexOf(':') + 2, msg.length))}`)
        currentItem.logs.push({
          type: 'JSON',
          key: `${i}-${j}`,
          title: `JSON Object: ${msg.substring(0, msg.indexOf(':'))} `,
          icon: 'code',
          message: msg.substring(msg.indexOf(':') + 1, msg.length),
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && isObj(msg)) {
        // JSON Object validation
        msgL = msgL.replace(/:N\/A,/g, ':"N/A",')
        // console.log(msg)
        // (`testObj: ${JSON.stringify(msg.substring(msg.indexOf(':') + 2, msg.length))}`)
        currentItem.logs.push({
          type: 'JSON',
          key: `${i}-${j}`,
          title: 'JSON Object',
          icon: 'code',
          message: JSON.stringify(msg),
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && ((msg.toLowerCase().includes('api') && (msg.toLowerCase().includes('fail'))) || msg.toLowerCase().includes('o response from datares'))) {
        currentItem.logs.push({
          type: 'APIFAIL',
          key: `${i}-${j}`,
          title: 'API: Failed',
          icon: 'dangerous',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && containsAny(msg, ['nd of execution', 'no next message found. end dialo'])) {
        // JSON Object validation

        currentItem.logs.push({
          type: 'end',
          key: `${i}-${j}`,
          title: 'End of flow',
          icon: 'stop_circle',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && msg.toLowerCase().includes('tarting dialog for conversation')) {
        const thisMsg = msg.substring(msg.indexOf(':') + 1, msg.length)
        currentItem.logs.push({
          type: 'start',
          key: `${i}-${j}`,
          title: 'Starting Dialog for Conversation',
          icon: 'play_circle',
          message: thisMsg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs && msg.toLowerCase().includes('rocessing successful. sending response back to user')) {
        // JSON Object validation

        currentItem.logs.push({
          type: 'success',
          key: `${i}-${j}`,
          title: 'Processed Successfully',
          icon: 'check_circle',
          message: msg,
          interactionName: interactionName || ''
        })
      } else if (currentItem?.logs) {
        // JSON Object validation

        currentItem.logs.push({
          type: 'general',
          icon: 'info',
          key: `${i}-${j}`,
          title: 'General Log Entry',
          message: msg,
          interactionName: interactionName || ''
        })
      }
    })
    if (
      currentItem.time &&
      currentItem.logCount &&
      currentItem.logs &&
      currentItem.key &&
      currentItem.phrase
    ) {
      debugLogObj.logs.push(currentItem)
    }
    console.log(debugLogObj)
  })
  return debugLogObj

  // __initConversation()
  // debug message from interaction
}

export const jsonToKVPS = (data: string | object) => {
  // first test to confirm it is a JSON object
  /*
  {"result":

  {
            products: { // section title
                hammer: 1, // stuff
                'nails x100': 1,
                shovel: 1,
                'timber 100x100x3000': 8,
                'book - how to make catapults': 1
            },
            orderTotal: 379.00,
            deliveryStatus: {
                status: 'dispatched from local warehouse',
                'expected delivery date': '20-09-2021',
                address: '15 Fleet street, Southbank, 3006'
            }
        }

  "}
  */
  let obj: unknown
  if (typeof data === 'string') {
    obj = testJSON(data)
    if (typeof obj === 'string') {
      console.info(obj)
      return {
        type: 'string',
        value: obj
      }
    }
  } else {
    obj = data
  }
  if (isObj(obj) && 'result' in obj) {
    const result: { type: string; value: Array<{ title: string; content: Array<{ key: string; value: unknown }> }> } = {
      type: 'result',
      value: []
    }
    const resultObj = parse(obj.result as string)
    Object.keys(resultObj).forEach((key) => {
      const section: { title: string; content: Array<{ key: string; value: unknown }> } = {
        title: key,
        content: []
      }
      if (typeof resultObj[key] === 'object') {
        Object.keys(resultObj[key]).forEach((k) => {
          console.info(`key: ${k} value: ${resultObj[key][k]}`)
          section.content.push({ key: k, value: resultObj[key][k] })
        })
      } else {
        section.content.push({ key, value: resultObj[key] })
      }

      result.value.push(section)
    })
    return result
  }
  return {
    type: 'object',
    value: isObj(obj) && 'result' in obj && typeof obj.result === 'string' ? testJSON(obj.result) : obj
  }
}
