// use main timezones for following lists
const AU_TIME_ZONES = [
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Broken_Hill',
  'Australia/Currie',
  'Australia/Darwin',
  'Australia/Eucla',
  'Australia/Hobart',
  'Australia/Lindeman',
  'Australia/Lord_Howe',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Australia/ACT',
  'Australia/Canberra',
]
const NZ_TIME_ZONES = [
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Pacific/Fakaofo',
  'Pacific/Fiji',
  'Pacific/Funafuti',
  'Pacific/Kiritimati',
  'Pacific/Majuro',
  'Pacific/Nauru',
  'Pacific/Tarawa',
  'Pacific/Tongatapu',
  'Pacific/Wellington',
  'Pacific/Wallis',
]
const JP_TIME_ZONES = [
  'Asia/Tokyo',
  'Asia/Sapporo',
  'Asia/Okinawa',
  'Japan',
]
const US_TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Adak',
  'Pacific/Honolulu',
  'US/Eastern',
  'US/Central',
  'US/Mountain',
  'US/Pacific',
  'US/Alaska',
  'US/Hawaii'
]
const EU_TIME_ZONES = [
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Europe/Athens',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/Istanbul',
  'Europe/Madrid',
  'Europe/Oslo',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Sofia',
  'Europe/Stockholm',
]
const SEA_TIME_ZONES = [
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Manila',
  'Asia/Ho_Chi_Minh',
  'Asia/Phnom_Penh',
  'Asia/Vientiane',
  'Asia/Brunei',
  'Asia/Makassar',
  'Asia/Pontianak',
  'Asia/Jayapura',
  'Asia/Ujung_Pandang',
  'Asia/Dili',
  'Asia/Yangon',
  'Asia/Bangkok',
  'Asia/Saigon',
  'Asia/Hovd',
  'Asia/Hong_Kong',
  'Asia/Macau',
]

export const returnTZ = (zone: string) => {
  const random = Math.random()
  if (zone === 'z3') {
    if (random < 0.75) {
      return AU_TIME_ZONES[Math.floor(Math.random() * AU_TIME_ZONES.length)]
    } else if (random < 0.85) {
      return NZ_TIME_ZONES[Math.floor(Math.random() * NZ_TIME_ZONES.length)]
    } else if (random < 0.90) {
      return JP_TIME_ZONES[Math.floor(Math.random() * JP_TIME_ZONES.length)]
    } else if (random < 0.95) {
      return US_TIME_ZONES[Math.floor(Math.random() * US_TIME_ZONES.length)]
    } else if (random < 1) {
      return SEA_TIME_ZONES[Math.floor(Math.random() * SEA_TIME_ZONES.length)]
    }
  }
  if (zone === 'z2') {
    if (random < 0.95) {
      return EU_TIME_ZONES[Math.floor(Math.random() * EU_TIME_ZONES.length)]
    } else if (random < 1) {
      return US_TIME_ZONES[Math.floor(Math.random() * US_TIME_ZONES.length)]
    }
  }
  if (zone === 'z1') {
    if (random < 0.85) {
      return US_TIME_ZONES[Math.floor(Math.random() * US_TIME_ZONES.length)]
    } else if (random < 0.90) {
      return EU_TIME_ZONES[Math.floor(Math.random() * EU_TIME_ZONES.length)]
    } else if (random < 0.95) {
      return SEA_TIME_ZONES[Math.floor(Math.random() * SEA_TIME_ZONES.length)]
    } else if (random < 1) {
      return AU_TIME_ZONES[Math.floor(Math.random() * AU_TIME_ZONES.length)]
    }
  }

}

