// import { defineStore } from 'pinia'
// import { Notify } from 'quasar'
// import { ACTION_KEYS, DEMO_BUILDER_ACTION_KEYS, DEMO_BUILDER_ROUTES, GRADIENT_TYPES } from 'src/constants'
// // import * as short from 'short-uuid'
// // const { generate: uuid } = short
// import { useDemoStore } from './store-demo'
// import { BrandKit, MessagingWindowConfig, ProactiveConfiguration, ProactiveTemplate } from 'src/interfaces'
// import ApiService from 'src/services/ApiService'
// import ErrorService from 'src/services/ErrorService'
// import { useUserStore } from './store-user'
// import { createGradient, CSSGrad, sortColorArray } from 'src/utils/common'
// interface PiniaState {
//   accountId: string;
//   windowConfig: MessagingWindowConfig | null,
//   windowConfigs: MessagingWindowConfig[]
//   proactiveConfiguration: ProactiveConfiguration | null;
//   proactiveConfigurations: ProactiveConfiguration[];
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   handoffs: any
// }

// export const useConfigStore = defineStore('config', {
//   state: (): PiniaState => ({
//     accountId: null,
//     proactiveConfiguration: null,
//     proactiveConfigurations: [],
//     windowConfig: null,
//     windowConfigs: [],
//     handoffs: {}
//   }),
//   getters: {},
//   actions: {
//     async addWindowConfig (windowConfig: MessagingWindowConfig): Promise<MessagingWindowConfig | void> {
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       try {
//         if (!siteId) throw new Error('No siteId found')
//         const actionKey = ACTION_KEYS.ADD_WINDOW_CONFIG
//         const url = DEMO_BUILDER_ROUTES.MESSAGING_WINDOW(siteId)
//         ApiService.post<MessagingWindowConfig>(
//           url,
//           windowConfig,
//           actionKey
//         )
//         this.$patch({
//           windowConfig
//         })
//         return windowConfig
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     async saveWindowConfig (windowConfig: MessagingWindowConfig): Promise<MessagingWindowConfig | void> {
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       if (!windowConfig.id) {
//         throw new Error('No windowConfig.id found')
//       }
//       try {
//         if (!siteId) throw new Error('No siteId found')
//         const actionKey = ACTION_KEYS.ADD_WINDOW_CONFIG
//         const url = DEMO_BUILDER_ROUTES.MESSAGING_WINDOW_BY_ID(siteId, windowConfig.id)
//         ApiService.patch<MessagingWindowConfig>(
//           url,
//           windowConfig,
//           actionKey
//         )
//         this.$patch({
//           windowConfig
//         })
//         return windowConfig
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     applyBranding (brandKit: BrandKit) {
//       const wc = this.windowConfig as MessagingWindowConfig
//       const { themeColors, defaultAssets } = brandKit
//       const primary = themeColors.find(color => color.name.toLowerCase() === 'primary') || { color: '#3863e5' }
//       const secondary = themeColors.find(color => color.name.toLowerCase() === 'secondary') || { color: '#8d46eb' }
//       // const tertiary = themeColors.find(color => color.name.toLowerCase() === 'tertiary') || '#e849b7'
//       const gradient = createGradient(GRADIENT_TYPES.LINEAR, [primary.color, secondary.color])
//       this.windowConfig.top.bg.gradient = gradient
//       const cssLinear = CSSGrad(gradient)
//       this.windowConfig.top.bg.custom = cssLinear
//       this.windowConfig.banner.imageUrl = brandKit.defaultAssets.windowHeader || this.windowConfig.banner.imageUrl

//       this.windowConfig.top.avatar = defaultAssets.windowHeader || ''
//       wc.body.agentMessages.avatar = defaultAssets.agentAvatar || ''
//       wc.banner.imageUrl = defaultAssets.windowBanner || ''
//       wc.body.agentMessages.bgColor.useCustom = false
//       wc.body.agentMessages.bgColor.color = primary.color
//       wc.body.customerMessages.bgColor.useCustom = false
//       wc.body.customerMessages.bgColor.color = secondary.color
//       wc.engagement.backLayer.useCustom = true
//       wc.engagement.backLayer.custom = cssLinear
//       wc.engagement.backLayer.color = primary.color
//       wc.engagement.background.color = '#ffffff'
//       wc.engagement.background.useCustom = false
//       wc.content.buttons.bgColor.useCustom = false
//       wc.content.buttons.bgColor.color = primary.color
//       wc.content.cards.buttonBgColor.useCustom = false
//       wc.content.cards.buttonBgColor.color = primary.color

//       if (brandKit.defaultAssets.brandIcon) {
//         wc.body.agentMessages.avatar = brandKit.defaultAssets.brandIcon
//       }
//       if (brandKit.defaultAssets.brandLogoWhite) {
//         wc.top.avatar = brandKit.defaultAssets.brandLogoWhite
//       }
//     },
//     async removeWindowConfig (windowId: string): Promise<void> {
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       try {
//         if (!siteId) throw new Error('No siteId found')
//         const actionKey = ACTION_KEYS.REMOVE_WINDOW_CONFIG
//         const url = DEMO_BUILDER_ROUTES.MESSAGING_WINDOW_BY_ID(siteId, windowId)
//         ApiService.delete(
//           url,
//           actionKey
//         )
//         this.$patch({
//           windowConfig: null
//         })
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     async getWindowConfigs (useCache?: boolean): Promise<MessagingWindowConfig[] | void> {
//       if (useCache && this.windowConfigs.length > 0) { return this.windowConfigs }
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       try {
//         const actionKey = ACTION_KEYS.GET_WINDOW_CONFIGS
//         const url = DEMO_BUILDER_ROUTES.MESSAGING_WINDOW(siteId)
//         const response = await ApiService.get<MessagingWindowConfig[]>(
//           url,
//           actionKey
//         )
//         this.$patch({
//           windowConfigs: response.data
//         })
//         return response.data
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     async getWindowConfig (windowId: string): Promise<MessagingWindowConfig | void> {
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       try {
//         const actionKey = ACTION_KEYS.GET_WINDOW_CONFIG
//         const url = DEMO_BUILDER_ROUTES.MESSAGING_WINDOW_BY_ID(siteId, windowId)
//         const response = await ApiService.get<MessagingWindowConfig>(
//           url,
//           actionKey
//         )
//         this.$patch({
//           windowConfig: response.data
//         })
//         return response.data
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async getAllThemes (): Promise<any> {
//       const siteId = useUserStore().siteId
//       if (!siteId) {
//         throw new Error('No siteId found')
//       }
//       try {
//         const actionKey = ACTION_KEYS.GET_ALL_THEMES
//         const url = DEMO_BUILDER_ROUTES.THEMES(siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const response = await ApiService.get<any>(
//           url,
//           actionKey
//         )
//         return response.data
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async getBrand (webUrl: string): Promise<any> {
//       try {
//         const siteId = useUserStore().siteId
//         if (!siteId) { throw new Error('No siteId found') }
//         if (!webUrl) { throw new Error('No webUrl found') }
//         const demo = useDemoStore().demo
//         if (!demo) { throw new Error('No demo found') }
//         const actionKey = DEMO_BUILDER_ACTION_KEYS.EXTRACT_BRAND
//         const url = DEMO_BUILDER_ROUTES.BRANDING(siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const { data } = await ApiService.get<any>(url, actionKey, null, { headers: { url: webUrl } })
//         console.info(data)

//         const { colors, images } = data

//         const sortedColors: string[] = sortColorArray(colors)
//         const sortImages = (images: string[]) => {
//           const _sortedImages: { name: string; url: string; }[] = []
//           for (const key in images) {
//             const url = images[key]
//             const name = url.split('/').pop() || url
//             console.info('name', name)
//             if (!_sortedImages.find((img) => img.name === name)) {
//               _sortedImages.push({ name, url })
//             }
//           }
//           return _sortedImages.sort((a, b) => a.name.localeCompare(b.name))
//         }
//         const sortedImages: { name: string; url: string; }[] = sortImages(images)

//         // this.brand = { colors: sortedColors, images: sortedImages }
//         demo.brandKit.colors = sortedColors
//         demo.brandKit.images = sortedImages
//         return demo.brandKit
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//         return []
//       }
//     },
//     async saveProactiveConfiguration (proactiveConfiguration: Partial<ProactiveConfiguration>): Promise<void> {
//       try {
//         const siteId = useUserStore().siteId
//         if (!siteId) {
//           throw new Error('No siteId found')
//         }
//         proactiveConfiguration.accountId = siteId
//         const actionKey = ACTION_KEYS.SAVE_PROACTIVE_CONFIGURATION
//         const url = DEMO_BUILDER_ROUTES.PROACTIVE_CONFIGURATION(siteId)
//         const { data } = await ApiService.post(url, proactiveConfiguration, actionKey)
//         this.$patch({
//           proactiveConfiguration: data
//         })
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     async getProductProactiveConfigurations (): Promise<ProactiveConfiguration[] | void> {
//       try {
//         const siteId = useUserStore().siteId
//         if (!siteId) {
//           throw new Error('No siteId found')
//         }
//         const actionKey = ACTION_KEYS.GET_PROACTIVE_CONFIGURATIONS
//         const url = DEMO_BUILDER_ROUTES.PROACTIVE_CONFIGURATION(siteId)
//         const response = await ApiService.get<ProactiveConfiguration[]>(url, actionKey)
//         this.$patch({
//           proactiveConfigurations: response.data
//         })
//         return response.data.sort((a, b) => a.name.localeCompare(b.name))
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async getProactiveHandoffs (): Promise<any> {
//       try {
//         const siteId = useUserStore().siteId
//         if (!siteId) {
//           throw new Error('No siteId found')
//         }
//         const authorization = useUserStore().proactiveToken
//         if (!authorization) {
//           throw new Error('No authorization found')
//         }
//         const actionKey = ACTION_KEYS.GET_PROACTIVE_HANDOFFS
//         const url = DEMO_BUILDER_ROUTES.PROACTIVE_HANDOFFS(siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const response = await ApiService.get<any>(url, actionKey, {}, { headers: { authorization } })
//         console.info('handoffs', response.data)
//         this.$patch({
//           handoffs: response.data
//         })
//         return response.data
//       } catch (error) {
//         Notify.create({
//           type: 'lpFail',
//           spinner: false,
//           message: 'Error',
//           caption: ErrorService.handleRequestError(error)
//         })
//         return []
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async sendProactive (configuration: ProactiveTemplate): Promise<any> {
//       try {
//         const siteId = useUserStore().siteId
//         if (!siteId) {
//           throw new Error('No siteId found')
//         }
//         const authorization = useUserStore().proactiveToken
//         if (!authorization) {
//           throw new Error('No authorization found')
//         }
//         const actionKey = ACTION_KEYS.SEND_PROACTIVE
//         const url = DEMO_BUILDER_ROUTES.SEND_PROACTIVE(siteId)
//         const { data } = await ApiService.post(url, configuration, actionKey, { authorization })
//         return data
//       } catch (error) {
//         console.info(error)
//         return error.response.data
//         // Notify.create({
//         //   type: 'lpFail',
//         //   spinner: false,
//         //   message: 'Error',
//         //   caption: ErrorService.handleRequestError(error)
//         // })
//       }
//     }
//   }
// })
