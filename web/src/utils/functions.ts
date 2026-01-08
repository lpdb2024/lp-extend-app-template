/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */

// import { boot } from 'quasar/wrappers'
import { v4 as uuidv4 } from "uuid";
export const uuid = uuidv4;
import { Notify, copyToClipboard } from "quasar";
// import { createPinia } from 'pinia'

import type { GoogleFileMeta } from "src/interfaces";
import { useRoute } from "vue-router";
const route = useRoute();

export const getAppInfo = () => {
  console.info(route, useRoute);
};
// import { storeToRefs } from 'pinia'
// const {
//   slideStyle
// } = storeToRefs(useDemoStore())

// import vClickOutside from 'click-outside-vue3'
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import CryptoJS from "crypto-js";
import AES from "crypto-js/aes";

export const copyItem = (a: string, useNotify?: boolean) => {
  copyToClipboard(a)
    .then(() => {
      // success!
      if (useNotify) {
        Notify.create({
          type: "lpInfo",
          message: "Copied to clipboard",
        });
      }
    })
    .catch(() => {
      // fail
    });
};

declare const window: Window &
  typeof globalThis & {
    lpTag: unknown;
    mobileCheck: unknown;
    opera: unknown;
    JSHINT: unknown;
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updater: any = {};
export const NotifyUpdate = (
  type: string,
  key: string,
  message: string,
  caption: string
) => {
  // console.info(type, message, type === 'success')
  if (!key || !type) return;
  updater[key] = updater[key] || {};

  if (type === "start") {
    // console.info(typeof window[key], window[key], hasOwnProperty.call(window[key], 'updateable'))
    // eslint-disable-next-line no-prototype-builtins
    if (updater[key].hasOwnProperty("updateable")) return;
    updater[key].updateable = Notify.create({
      type: "lpInfo",
      timeout: 0,
      message,
      caption,
      spinner: true,
      group: false,
      position: "top",
    });
  } else if (type === "update") {
    updater[key].updateable({
      type: "lpInfo",
      message,
      caption,
    });
  } else if (type === "error") {
    updater[key].updateable({
      type: "lpFail",
      timeout: 3000,
      message,
      caption,
      spinner: false,
    });
  } else if (type === "success") {
    // console.log('success type statement')
    updater[key].updateable({
      type: "lpSuccess",
      timeout: 1000,
      message,
      caption,
      spinner: false,
    });
  }
  setTimeout(() => {
    try {
      updater[key].dismiss();
    } catch {
      // Silent catch - error ignored
    }
  }, 10000);
};

export const findPatterns = (pattern: RegExp, string: string) => {
  const arr: string[] = [];
  let m;
  do {
    m = pattern.exec(string);
    console.info(m);
    if (m) {
      arr.push(m[0]);
      console.log(m[1], m[2]);
    }
  } while (m);
  return arr;
};

export const sortByKey = <T extends Record<string, unknown>>(key: string, data: T[]) => {
  return data.sort((a, b) => {
    let textA = String(a[key]).toUpperCase();
    let textB = String(b[key]).toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
};

export const sortName = (a: { name: string }, b: { name: string }) => {
  let textA = a.name.toUpperCase();
  let textB = b.name.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
};
export const deepCopy = <T>(src: T): T => {
  return JSON.parse(JSON.stringify(src));
};

export const sortObj = (obj: Record<string, unknown>) => {
  const ordered: Record<string, unknown> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      ordered[key] = obj[key];
    });
  return ordered;
};

export const isObj = (a: unknown): a is Record<string, unknown> => {
  return typeof a === "object" && !Array.isArray(a) && a !== null;
};

// const testJSON = (a: string) => {
//   try {
//     return JSON.parse(a)
//   } catch (error) {
//   }
// }
export const contains = (string: string, value: string) => {
  return !!string.toLowerCase().includes(value);
};
export const containsAll = (string: string, values: string[]) => {
  let f = true;
  values.forEach((v) => {
    if (!string.toLowerCase().includes(v)) f = false;
  });
  return f;
};
export const containsAny = (string: string, values: string[]) => {
  let f = false;
  values.forEach((v) => {
    if (string.toLowerCase().includes(v)) f = true;
  });
  return f;
};

export const valueInArray = (val: string, array: string[]) => {
  const f = false;
  array.forEach((a) => {
    if (f) return;
    if (val.toLowerCase().includes(a)) {
      return true;
    }
  });
  return f;
};

/*
const ordered = Object.keys(unordered).sort().reduce(
  (obj, key) => {
    obj[key] = unordered[key];
    return obj;
  },
  {}
);
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pbcsCtx: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pSBC = (p: any, c0: any, c1: any, l: any) => {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 === "string";

  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 !== "string" ||
    (c0[0] != "r" && c0[0] != "#") ||
    (c1 && !a)
  )
    return null;
  if (!pbcsCtx) {
    pbcsCtx = (d: string) => {
      let n = d.length;
      const x: Record<string, number> = {};
      if (n > 9) {
        const parts = d.split(",");
        n = parts.length;
        if (n < 3 || n > 4) return null;

        const rPart = parts[0] || "";
        const gPart = parts[1] || "";
        const bPart = parts[2] || "";
        const aPart = parts[3];

        (x.r = i(rPart[3] == "a" ? rPart.slice(5) : rPart.slice(4))),
          (x.g = i(gPart)),
          (x.b = i(bPart)),
          (x.a = aPart ? parseFloat(String(aPart)) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        let dStr = d;
        if (n < 6)
          dStr =
            "#" +
            d[1] +
            d[1] +
            d[2] +
            d[2] +
            d[3] +
            d[3] +
            (n > 4 && d[4] ? d[4] + d[4] : "");
        const dNum = i(dStr.slice(1), 16);

        if (n == 9 || n == 5)
          (x.r = (dNum >> 24) & 255),
            (x.g = (dNum >> 16) & 255),
            (x.b = (dNum >> 8) & 255),
            (x.a = m((dNum & 255) / 0.255) / 1000);
        else
          (x.r = dNum >> 16), (x.g = (dNum >> 8) & 255), (x.b = dNum & 255), (x.a = -1);
      }
      return x;
    };
  }

  (h = c0.length > 9),
    (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
    (f = pbcsCtx(c0)),
    (P = p < 0),
    (t =
      c1 && c1 != "c"
        ? pbcsCtx(c1)
        : P
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 }),
    (p = P ? p * -1 : p),
    (P = 1 - p);
  if (!f || !t) return null;

  if (l)
    (r = m(P * f.r + p * t.r)),
      (g = m(P * f.g + p * t.g)),
      (b = m(P * f.b + p * t.b));
  else
    (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
      (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
      (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));

  (a = f.a),
    (t = t.a),
    (f = Number(a) >= 0 || t >= 0),
    (a = f ? (Number(a) < 0 ? t : t < 0 ? a : Number(a) * P + t * p) : 0);
  if (h)
    return (
      "rgb" +
      (f ? "a(" : "(") +
      r +
      "," +
      g +
      "," +
      b +
      (f ? "," + m(Number(a) * 1000) / 1000 : "") +
      ")"
    );
  else
    return (
      "#" +
      (
        4294967296 +
        r * 16777216 +
        g * 65536 +
        b * 256 +
        (f ? m(Number(a) * 255) : 0)
      )
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
};
export const lastPos = (array: number[], index: number) => {
  try {
    return array.length - 1 === Number(index);
  } catch {
    //
  }
};
export const parse = (src: string) => {
  try {
    return JSON.parse(src);
  } catch {
    return src;
  }
};
export const stringify = (src: unknown) => {
  try {
    return JSON.stringify(src);
  } catch {
    return String(src);
  }
};
export const randomArray = <T>(array: T[]): T | undefined => {
  return array[Math.floor(Math.random() * array.length)];
};
export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const typeOf = (value: unknown) => {
  if (!value || value === null) return "null";
  if (typeof value === "object") {
    if (Array.isArray(value)) return "array";
    return "object";
  }
  return typeof value;
};
export const decrypt = (src: string) => {
  if (!process.env.SALT_TOKEN) return;
  const passphrase: string = process.env.SALT_TOKEN;
  if (!src || !passphrase) return;
  const p: string = passphrase || "";
  const bytes = AES.decrypt(src, p);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};
export const scaleEl = (ratio: number, i: number) => {
  const W = ratio || 1;
  return i / W;
};
export const lastIndex = <T>(array: T[], index: number) => {
  try {
    return index === array.length - 1;
  } catch {
    return false;
  }
};

export const lastIndexInArray = <T>(array: T[]) => {
  try {
    return array.length - 1;
  } catch {
    return -1;
  }
};

export const isNZ = (a: number) => {
  return !!a || a === 0;
};

export const encrypt = (src: string) => {
  if (!process.env.SALT_TOKEN) return;
  const passphrase = process.env.SALT_TOKEN;
  return AES.encrypt(src, passphrase).toString();
};

export const loadScript = (url: string) => {
  const s = document.createElement("script");
  s.setAttribute("src", url);
  document.head.appendChild(s);
};

export const checkDevice = () => {
  window.mobileCheck = function () {
    let check = false;
    (function (a: string) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm|cell|chtm|cldc|cmd|co(mp|nd)|craw|da(it|ll|ng)|dbte|dcs|devi|dica|dmob|do(c|p)o|ds(12|d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(|_)|g1 u|g560|gene|gf5|gmo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(String(navigator.userAgent || navigator.vendor || window.opera));
    return check;
  };
};
export const mdToLink = (markdown: string) => {
  const html = markdown
    .replace(/#\/md#/gim, "") // h3 tag
    .replace(/#md#/, "")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>") // h2 tag
    .replace(/^# (.*$)/gim, "<h1>$1</h1>") // h1 tag
    .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>") // bold text
    .replace(/\*(.*)\*/gim, "<i>$1</i>") // italic text
    .replace(/\r\n|\r|\n/gim, "<br>") // linebreaks
    .replace(/\[([^[]+)\](\(([^)]*))\)/gim, '<a href="$3">$1</a>');
  return html;
};
export const nToBr = (text: string) => {
  try {
    return text.replace(/\n/g, "<br />");
  } catch {
    return text;
  } finally {
    // console.info('nToBr', text)
  }
};

export const isValidUrl = (urlString: string) => {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export const encodeImage = (url: string) => {
  const uri = encodeURI(url);
  return uri;
};

export const getHTLMproperties = (a: HTMLElement) => {
  const { innerHeight: IH, innerWidth: IW } = window;
  try {
    return {
      height: a.clientHeight,
      width: a.clientWidth,
      left: a.offsetLeft,
      top: a.offsetTop,
      bottom: a.offsetTop + a.clientHeight,
      right: a.offsetLeft + a.clientWidth,
      heightRatio: a.clientHeight / IH,
      widthRatio: a.clientWidth / IW,
    };
  } catch {
    return null;
  }
};

export const urlToGoogleFile = (url: string) => {
  const name = url.split("/").pop();
  const type = url.split(".").pop();
  return {
    value: String(url),
    name: name || "",
    content_type: String(type),
    size: 0,
    url: String(url),
  };
};

export const urlToGoogleFiles = (urls: string[]) => {
  const files: GoogleFileMeta[] = [];
  urls.forEach((file) => {
    const gFile: GoogleFileMeta = urlToGoogleFile(file);
    files.push(gFile);
  });
  return files;
};

export const styleProperties = (obj: Record<string, unknown>) => {
  if (!obj) return {};
  const keys = Object.keys(obj);
  // remove any properties from object that do no include prefix '--'
  const filtered = keys.filter((key) => key.includes("--"));
  // return object with only properties that include '--'
  return Object.fromEntries(filtered.map((key) => [key, obj[key]]));
};

// export const filter = (val: string, update: (arg0: { (): void; (): void; }) => void, values: any, options: any) => {
//   if (val === '') {
//     update(() => {
//       options = values
//     })
//     return
//   }

//   update(() => {
//     const needle = val.toLowerCase()
//     options = values.filter((v: any) => v.toLowerCase().indexOf(needle) > -1 || String(v.id).indexOf(needle) > -1)
//   })
// }

export const generateName = () => {
  const firstNames = [
    "Aaliyah",
    "Aaron",
    "Abby",
    "Abigail",
    "Ada",
    "Adam",
    "Addison",
    "Adeline",
    "Adrian",
    "Adriana",
    "Adrianna",
    "Aidan",
    "Aiden",
    "Aimee",
    "Alaina",
    "Alan",
    "Alana",
    "Alayna",
    "Albert",
    "Alec",
    "Alejandra",
    "Alex",
    "Alexa",
    "Alexander",
    "Alexandra",
    "Alexandria",
    "Alexia",
    "Alexis",
    "Alice",
    "Alicia",
    "Alina",
    "Alison",
    "Alivia",
    "Aliyah",
    "Allison",
    "Ally",
    "Allyson",
    "Alondra",
    "Alvin",
    "Alyssa",
    "Amalia",
    "Amanda",
    "Amaya",
    "Amber",
    "Amelia",
    "Amelie",
    "Amir",
    "Amiyah",
    "Amy",
    "Ana",
    "Anastasia",
    "Andre",
    "Andrea",
    "Andres",
    "Andrew",
    "Angel",
    "Angela",
    "Angelica",
    "Angelina",
    "Angeline",
    "Angelo",
    "Angie",
    "Anika",
    "Aniya",
    "Anna",
    "Annabelle",
    "Anne",
    "Annie",
    "Annika",
    "Anthony",
    "Antonio",
    "April",
    "Arabella",
    "Archer",
    "Ari",
    "Aria",
    "Ariana",
    "Arianna",
    "Ariel",
    "Armando",
    "Armani",
    "Arnav",
    "Arthur",
    "Arya",
    "Asher",
    "Ashley",
    "Ashlyn",
    "Ashton",
    "Asia",
    "Aspen",
    "Athena",
    "Aubree",
    "Aubrey",
    "Audrey",
    "August",
    "Augustus",
    "Aurora",
    "Austin",
    "Ava",
    "Avery",
    "Axel",
    "Ayden",
    "Bailey",
    "Barbara",
    "Barrett",
    "Barry",
    "Beau",
    "Beckett",
    "Bella",
    "Ben",
    "Benjamin",
    "Bennett",
    "Bentley",
    "Bernard",
    "Bethany",
    "Bianca",
    "Billy",
    "Blake",
    "Blakely",
    "Bobby",
    "Bonnie",
    "Bradley",
    "Brady",
    "Brandon",
    "Brantley",
    "Braxton",
    "Brayden",
    "Brenda",
    "Brendan",
    "Brennan",
    "Brent",
    "Brett",
    "Brian",
    "Briana",
    "Brianna",
    "Bridget",
    "Brielle",
    "Brinley",
    "Brittany",
    "Brock",
    "Brody",
    "Brooke",
    "Brooklyn",
    "Brooks",
    "Bruce",
    "Bryan",
    "Bryce",
    "Brynn",
    "Bryson",
    "Caden",
    "Caitlin",
    "Caleb",
    "Callie",
    "Calvin",
    "Cameron",
    "Camila",
    "Camilla",
    "Camille",
    "Camryn",
    "Cara",
    "Carina",
    "Carla",
    "Carlos",
    "Carly",
    "Carmen",
    "Caroline",
    "Carson",
    "Carter",
    "Casey",
    "Cassandra",
    "Cassidy",
    "Catherine",
    "Cecilia",
    "Celeste",
    "Cesar",
    "Chad",
    "Chandler",
    "Chanel",
    "Channing",
    "Charlee",
    "Charles",
    "Charlie",
    "Charlotte",
    "Chase",
    "Chelsea",
    "Chloe",
    "Chris",
    "Christian",
    "Christina",
    "Christine",
    "Christopher",
    "Cindy",
    "Claire",
    "Clara",
    "Clarence",
    "Clark",
    "Claudia",
    "Clayton",
    "Cody",
    "Colby",
    "Cole",
    "Colin",
    "Collin",
    "Colton",
    "Conner",
    "Connor",
    "Conor",
    "Cooper",
    "Cora",
    "Corey",
    "Cory",
    "Courtney",
    "Craig",
    "Cristian",
    "Cristina",
    "Crystal",
    "Curtis",
    "Cynthia",
    "Daisy",
    "Dakota",
    "Dale",
    "Dallas",
    "Dalton",
    "Damian",
    "Damien",
    "Damon",
    "Dan",
    "Dana",
    "Daniel",
    "Daniela",
    "Danielle",
    "Danny",
    "Dante",
    "Daphne",
    "Darius",
    "Darren",
    "Darwin",
    "Daryl",
    "Dave",
    "David",
    "Dawson",
    "Dean",
    "Deanna",
    "Deborah",
    "Declan",
    "Delaney",
    "Delilah",
    "Demetri",
    "Denise",
    "Dennis",
    "Derek",
    "Desiree",
    "Destiny",
    "Devin",
    "Devon",
    "Diana",
    "Diego",
    "Dillon",
    "Dina",
    "Dion",
    "Dominic",
    "Dominick",
    "Don",
    "Donald",
    "Donovan",
    "Dorian",
    "Drew",
    "Dustin",
    "Dylan",
    "Ean",
    "Easton",
    "Eddie",
    "Eden",
    "Edgar",
    "Edith",
    "Edmund",
    "Eduardo",
    "Edward",
    "Edwin",
    "Eileen",
    "Eleanor",
    "Elena",
    "Eli",
    "Eliana",
    "Elias",
    "Elijah",
    "Elise",
    "Eliza",
    "Elizabeth",
    "Ella",
    "Ellen",
    "Ellie",
    "Elliot",
    "Elliott",
    "Eloise",
    "Elsa",
    "Elsie",
    "Elvis",
    "Elyse",
    "Emanuel",
    "Emerson",
    "Emery",
    "Emiliano",
    "Emilio",
    "Emily",
    "Emma",
    "Emmanuel",
    "Emmett",
    "Enrique",
    "Eric",
    "Erica",
    "Erick",
    "Erik",
    "Erika",
    "Erin",
    "Ernest",
    "Ernesto",
    "Esmeralda",
    "Esteban",
    "Esther",
    "Estrella",
    "Ethan",
    "Eugene",
    "Eva",
    "Evan",
    "Evangeline",
    "Eve",
    "Evelyn",
    "Everett",
    "Ezekiel",
    "Ezra",
    "Faith",
    "Felicity",
    "Fernando",
    "Finn",
    "Fiona",
    "Fletcher",
    "Frances",
    "Francesca",
    "Francis",
    "Frank",
    "Frankie",
    "Franklin",
    "Frederick",
    "Gabriel",
    "Gabriela",
    "Gabriella",
    "Gabrielle",
    "Gage",
    "Gavin",
    "Gemma",
    "Genesis",
    "Genevieve",
    "George",
    "Georgia",
    "Gerald",
    "Gia",
    "Giana",
    "Gianna",
    "Giovanni",
    "Giselle",
    "Gloria",
    "Grace",
    "Gracie",
    "Graham",
    "Grant",
    "Grayson",
    "Gregory",
    "Greta",
    "Greyson",
    "Griffin",
    "Guadalupe",
    "Gustavo",
    "Hadley",
    "Hailee",
    "Hailey",
    "Haley",
    "Halle",
    "Hallie",
    "Hanna",
    "Hannah",
    "Harley",
    "Harlow",
    "Harmony",
    "Harper",
    "Harrison",
    "Harry",
    "Hazel",
    "Heather",
    "Heaven",
    "Hector",
    "Heidi",
    "Helen",
    "Henry",
    "Holly",
    "Hope",
    "Hudson",
    "Hugo",
    "Hunter",
    "Ian",
    "Ibrahim",
    "Iker",
    "Imani",
    "India",
    "Ingrid",
    "Irene",
    "Iris",
    "Isaac",
    "Isabel",
    "Isabella",
    "Isabelle",
    "Isaiah",
    "Isaias",
    "Isla",
    "Ismael",
    "Ivan",
    "Ivy",
    "Izabella",
    "Jace",
    "Jack",
    "Jackie",
    "Jackson",
    "Jacob",
    "Jacqueline",
    "Jada",
    "Jade",
    "Jaden",
    "Jaelyn",
    "Jaime",
    "Jake",
    "Jakob",
    "Jalen",
    "James",
    "Jamie",
    "Jana",
    "Jane",
    "Janelle",
    "Janiya",
    "Jared",
    "Jasmin",
    "Jasmine",
    "Jason",
    "Jasper",
    "Javier",
    "Jay",
    "Jayce",
    "Jaycee",
    "Jayden",
    "Jayla",
    "Jaylee",
    "Jaylen",
    "Jaylin",
    "Jayson",
    "Jazlyn",
    "Jazmin",
    "Jazmine",
    "Jazmyn",
    "Jazmyne",
    "Jean",
    "Jeffrey",
    "Jenna",
    "Jennifer",
    "Jenny",
    "Jeremiah",
    "Jeremy",
    "Jermaine",
    "Jerome",
    "Jerry",
    "Jesse",
    "Jessica",
    "Jessie",
    "Jesus",
    "Jillian",
    "Jimena",
    "Jimmy",
    "Joan",
    "Joanna",
    "Jocelyn",
    "Joe",
    "Joel",
    "Joey",
    "Johanna",
    "John",
    "Johnny",
    "Jonah",
    "Jonas",
    "Jonathan",
    "Jordan",
    "Jordyn",
    "Jorge",
    "Jose",
    "Joseph",
    "Josephine",
    "Joshua",
    "Josiah",
    "Josie",
    "Josue",
    "Journey",
    "Joy",
    "Joyce",
    "Juan",
    "Judah",
    "Jude",
    "Judith",
    "Julianna",
    "Julie",
    "Juliet",
    "Juliette",
    "Julio",
    "Julissa",
    "Julius",
    "June",
    "Junior",
    "Justice",
    "Justin",
    "Kaden",
    "Kadence",
    "Kai",
    "Kaia",
    "Kaiden",
    "Kailyn",
    "Kaitlyn",
    "Kaleb",
    "Kali",
    "Kamari",
    "Kamden",
    "Kameron",
    "Kamila",
    "Kara",
    "Karen",
    "Karina",
    "Karla",
    "Kasey",
    "Kassandra",
    "Kate",
    "Katelyn",
    "Katherine",
    "Kathleen",
    "Kathryn",
    "Katie",
    "Katrina",
    "Kayden",
    "Kayla",
    "Kaylee",
    "Kayleigh",
    "Kaylie",
    "Kaylin",
    "Keegan",
    "Keira",
    "Keith",
    "Kellan",
    "Kellen",
    "Kelly",
    "Kelsey",
    "Kendall",
    "Kendra",
    "Kennedy",
    "Kenneth",
    "Kenny",
    "Kent",
    "Kenzie",
    "Kevin",
    "Keyla",
    "Khloe",
    "Kian",
    "Kiera",
    "Kieran",
    "Kierra",
    "Kiley",
    "Kim",
    "Kimberly",
    "King",
    "Kinsley",
    "Kira",
    "Kirsten",
    "Knox",
    "Kobe",
    "Kody",
    "Kyla",
    "Kyle",
    "Kylee",
    "Kyleigh",
    "Kyler",
    "Kylie",
    "Kyra",
    "Lacey",
    "Laila",
    "Lainey",
    "Lamar",
    "Lana",
    "Landon",
    "Lara",
    "Larry",
    "Laura",
    "Lauren",
    "Lauryn",
    "Layla",
    "Laylah",
    "Lea",
    "Leah",
    "Leandro",
    "Leanna",
    "Leia",
    "Leilani",
    "Lena",
    "Leo",
    "Leon",
    "Leona",
    "Leonardo",
    "Leonel",
    "Leonidas",
    "Leslie",
    "Lesly",
    "Leticia",
    "Levi",
    "Leyla",
    "Liam",
    "Liana",
    "Liberty",
    "Lila",
    "Lilah",
    "Lilian",
    "Liliana",
    "Lillian",
    "Lilliana",
    "Lilly",
    "Lily",
    "Lina",
    "Linda",
    "Lindsay",
    "Lindsey",
    "Lisa",
    "Lizbeth",
    "Logan",
    "London",
    "Londyn",
    "Lorenzo",
    "Louis",
    "Luca",
    "Lucas",
    "Lucia",
    "Lucian",
    "Luciana",
    "Lucille",
    "Lucy",
    "Luis",
    "Lukas",
    "Luke",
    "Luna",
    "Lydia",
    "Lyla",
    "Lyric",
    "Mabel",
    "Maci",
    "Mackenzie",
    "Macy",
    "Madalyn",
    "Maddox",
    "Madeleine",
    "Madeline",
    "Madelyn",
    "Madelynn",
    "Madilyn",
    "Madison",
    "Madyson",
    "Mae",
    "Maggie",
    "Makayla",
    "Makenzie",
    "Malachi",
    "Malcolm",
    "Malik",
    "Mallory",
    "Mandy",
    "Manuel",
    "Mara",
    "Marc",
    "Marcel",
    "Marcelo",
    "Marco",
    "Marcos",
    "Marcus",
    "Margaret",
    "Maria",
    "Mariah",
    "Mariana",
    "Marie",
    "Marilyn",
    "Marina",
    "Mario",
    "Marisa",
    "Marisol",
    "Marissa",
    "Mark",
    "Marley",
    "Marlon",
    "Marquis",
    "Marshall",
    "Martha",
    "Martin",
    "Marvin",
    "Mary",
    "Mason",
    "Mateo",
    "Mathew",
    "Mathias",
    "Matias",
    "Matilda",
    "Matt",
    "Matthew",
    "Matthias",
    "Maurice",
    "Mauricio",
    "Max",
    "Maxim",
    "Maximilian",
    "Maximus",
    "Maxwell",
    "Maya",
    "Mckenna",
    "Mckenzie",
    "Megan",
    "Melanie",
    "Melina",
    "Melissa",
    "Melody",
    "Melvin",
    "Meredith",
    "Mia",
    "Micah",
    "Michael",
    "Micheal",
    "Michelle",
    "Miguel",
    "Mikaela",
    "Mikayla",
    "Mike",
    "Mila",
    "Milan",
    "Miles",
    "Miley",
    "Milo",
    "Mina",
    "Mindy",
    "Miracle",
    "Miranda",
    "Miriam",
    "Misael",
    "Molly",
    "Monica",
    "Monique",
    "Morgan",
    "Moses",
    "Myla",
    "Myra",
    "Nadia",
    "Nancy",
    "Naomi",
    "Nash",
    "Natalia",
    "Natalie",
    "Nataly",
    "Nathan",
    "Nathaniel",
    "Nayeli",
    "Nehemiah",
    "Neil",
    "Nelson",
    "Nevaeh",
    "Nia",
    "Nicholas",
    "Nick",
    "Nicolas",
    "Nicole",
    "Nikolas",
    "Nina",
    "Noah",
    "Noe",
    "Noel",
    "Noelle",
    "Nolan",
    "Nora",
    "Norma",
    "Norman",
    "Nyla",
    "Nylah",
    "Oliver",
    "Olivia",
    "Omar",
    "Ophelia",
    "Orlando",
    "Oscar",
    "Owen",
    "Pablo",
    "Paige",
    "Paisley",
    "Paityn",
    "Pamela",
    "Paris",
    "Parker",
    "Patricia",
    "Patrick",
    "Paul",
    "Paula",
    "Payton",
    "Pedro",
    "Peyton",
    "Philip",
    "Phoebe",
    "Phoenix",
    "Piper",
    "Preston",
    "Prince",
    "Priscilla",
    "Quentin",
    "Quinn",
    "Rachel",
    "Rafael",
    "Raegan",
    "Raelyn",
    "Raelynn",
    "Raina",
    "Ralph",
    "Ramiro",
    "Ramon",
    "Randy",
    "Raul",
    "Raven",
    "Ray",
    "Rayan",
    "Raymond",
    "Rayna",
    "Rayne",
    "Reagan",
    "Rebecca",
    "Rebekah",
    "Reed",
    "Reese",
    "Regina",
    "Reid",
    "Reilly",
    "Reina",
    "Remington",
    "Remy",
    "Rene",
    "Reuben",
    "Rex",
    "Reyna",
    "Rhett",
    "Rhys",
    "Ricardo",
    "Richard",
    "Ricky",
    "Riley",
    "River",
    "Robert",
    "Roberto",
    "Rocco",
    "Rodney",
    "Roger",
    "Roland",
    "Roman",
    "Romeo",
    "Ronald",
    "Rory",
    "Rosa",
    "Rose",
    "Roselyn",
    "Rosemary",
    "Rosie",
    "Ross",
    "Rowan",
    "Roy",
    "Royal",
    "Royce",
    "Ruby",
    "Rudy",
    "Russell",
    "Ruth",
    "Ryan",
    "Ryann",
    "Ryder",
    "Ryker",
    "Rylan",
    "Rylee",
    "Ryleigh",
    "Rylie",
    "Sabrina",
    "Sadie",
    "Sage",
    "Saige",
    "Salvador",
    "Salvatore",
    "Sam",
    "Samantha",
    "Samara",
    "Samir",
    "Samson",
    "Samuel",
    "Sandra",
    "Santiago",
    "Santana",
    "Santos",
    "Sara",
    "Sarah",
    "Sarai",
    "Sasha",
    "Savanna",
    "Savannah",
    "Sawyer",
    "Scarlet",
    "Scarlett",
    "Scott",
    "Sean",
    "Sebastian",
    "Selah",
    "Selena",
    "Serena",
    "Serenity",
    "Sergio",
    "Seth",
    "Shane",
    "Shannon",
    "Sharon",
    "Shaun",
    "Shawn",
    "Shayla",
    "Shaylee",
    "Shayna",
    "Shea",
    "Shelby",
    "Sheldon",
    "Shelby",
    "Shiloh",
    "Shirley",
    "Sienna",
    "Sierra",
    "Silas",
    "Simon",
    "Sky",
    "Skye",
    "Skyla",
    "Skylar",
    "Skyler",
    "Sofia",
    "Solomon",
    "Sonia",
    "Sophia",
    "Sophie",
    "Spencer",
    "Stacey",
    "Stacy",
    "Stanley",
    "Stefan",
    "Stella",
    "Stephan",
    "Stephanie",
    "Stephen",
    "Steve",
    "Steven",
    "Stevie",
    "Summer",
    "Susan",
    "Sutton",
    "Sydney",
    "Sylvia",
    "Talia",
    "Talon",
    "Tamara",
    "Tanner",
    "Tara",
    "Taryn",
    "Tatiana",
    "Tatum",
    "Taya",
    "Taylor",
    "Teagan",
    "Teresa",
    "Terrell",
    "Terry",
    "Tessa",
    "Thalia",
    "Theo",
    "Theodore",
    "Thiago",
    "Thomas",
    "Tiana",
    "Tiffany",
    "Timothy",
    "Tina",
    "Toby",
    "Todd",
    "Tom",
    "Tomas",
    "Toni",
    "Tony",
    "Tori",
    "Travis",
    "Trent",
    "Trenton",
    "Trevor",
    "Trinity",
    "Tristan",
    "Troy",
    "Tyler",
    "Tyson",
    "Ulises",
    "Uriel",
    "Valentina",
    "Valeria",
    "Valerie",
    "Vanessa",
    "Vera",
    "Veronica",
    "Vicente",
    "Victor",
    "Victoria",
    "Vincent",
    "Violet",
    "Virginia",
    "Vivian",
    "Viviana",
    "Vivienne",
    "Wade",
    "Walker",
    "Walter",
    "Warren",
    "Waylon",
    "Wayne",
    "Wendy",
    "Wesley",
    "Weston",
    "William",
    "Willow",
    "Wilson",
    "Winston",
    "Wyatt",
    "Xander",
    "Xavier",
    "Ximena",
    "Yahir",
    "Yamileth",
    "Yandel",
    "Yaretzi",
    "Yasmin",
    "Yasmine",
    "Yazmin",
    "Yosef",
    "Yuliana",
    "Yusuf",
    "Zachariah",
    "Zachary",
    "Zack",
    "Zackary",
    "Zain",
    "Zander",
    "Zane",
    "Zara",
    "Zariah",
    "Zayden",
    "Zayne",
    "Zion",
    "Zoe",
    "Zoey",
    "Zoie",
    "Zuri",
  ];
  const lastNames = [
    "Abbott",
    "Acevedo",
    "Acosta",
    "Adams",
    "Adkins",
    "Aguilar",
    "Aguirre",
    "Albert",
    "Alexander",
    "Alford",
    "Allen",
    "Allison",
    "Alston",
    "Alvarado",
    "Alvarez",
    "Anderson",
    "Andrews",
    "Anthony",
    "Armstrong",
    "Arnold",
    "Ashley",
    "Atkins",
    "Atkinson",
    "Austin",
    "Avery",
    "Avila",
    "Ayala",
    "Ayers",
    "Bailey",
    "Baird",
    "Baker",
    "Baldwin",
    "Ball",
    "Ballard",
    "Banks",
    "Barber",
    "Barker",
    "Barlow",
    "Barnes",
    "Barnett",
    "Barr",
    "Barrera",
    "Barrett",
    "Barron",
    "Barry",
    "Bartlett",
    "Barton",
    "Bass",
    "Bates",
    "Battle",
    "Bauer",
    "Baxter",
    "Beach",
    "Bean",
    "Beard",
    "Beasley",
    "Beck",
    "Becker",
    "Bell",
    "Bender",
    "Benjamin",
    "Bennett",
    "Benson",
    "Bentley",
    "Benton",
    "Berg",
    "Berger",
    "Bernard",
    "Berry",
    "Best",
    "Bird",
    "Bishop",
    "Black",
    "Blackburn",
    "Blackwell",
    "Blair",
    "Blake",
    "Blanchard",
    "Blankenship",
    "Blevins",
    "Bolton",
    "Bond",
    "Bonner",
    "Booker",
    "Boone",
    "Booth",
    "Bowen",
    "Bowers",
    "Bowman",
    "Boyd",
    "Boyer",
    "Boyle",
    "Bradford",
    "Bradley",
    "Bradshaw",
    "Brady",
    "Branch",
    "Bray",
    "Brennan",
    "Brewer",
    "Bridges",
    "Briggs",
    "Bright",
    "Britt",
    "Brock",
    "Brooks",
    "Brown",
    "Browning",
    "Bruce",
    "Bryan",
    "Bryant",
    "Buchanan",
    "Buck",
    "Buckley",
    "Buckner",
    "Bullock",
    "Burch",
    "Burgess",
    "Burke",
    "Burks",
    "Burnett",
    "Burns",
    "Burnett",
    "Burris",
    "Burt",
    "Burton",
    "Bush",
    "Butler",
    "Byers",
    "Byrd",
    "Cabrera",
    "Cain",
    "Calderon",
    "Caldwell",
    "Calhoun",
    "Callahan",
    "Camacho",
    "Cameron",
    "Campbell",
    "Campos",
    "Cannon",
    "Cantrell",
    "Cantu",
    "Cardenas",
    "Carey",
    "Carlson",
    "Carney",
    "Carpenter",
    "Carr",
    "Carrillo",
    "Carroll",
    "Carson",
    "Carter",
    "Carver",
    "Case",
    "Casey",
    "Cash",
    "Castaneda",
    "Castillo",
    "Castro",
    "Cervantes",
    "Chambers",
    "Chan",
    "Chandler",
    "Chaney",
    "Chang",
    "Chapman",
    "Charles",
    "Chase",
    "Chavez",
    "Chen",
    "Cherry",
    "Christensen",
    "Christian",
    "Church",
    "Clark",
    "Clarke",
    "Clay",
    "Clayton",
    "Clements",
    "Clemons",
    "Cleveland",
    "Cline",
    "Cobb",
    "Cochran",
    "Coffey",
    "Cohen",
    "Cole",
    "Coleman",
    "Collier",
    "Collins",
    "Colon",
    "Combs",
    "Compton",
    "Conley",
    "Conner",
    "Conrad",
    "Contreras",
    "Conway",
    "Cook",
    "Cooke",
    "Cooley",
    "Cooper",
    "Copeland",
    "Cortez",
    "Cote",
    "Cotton",
    "Cox",
    "Craft",
    "Craig",
    "Crane",
    "Crawford",
    "Crosby",
    "Cross",
    "Cruz",
    "Cummings",
    "Cunningham",
    "Curry",
    "Curtis",
    "Dale",
    "Dalton",
    "Daniel",
    "Daniels",
    "Daugherty",
    "Davenport",
    "David",
    "Davidson",
    "Davis",
    "Dawson",
    "Day",
    "Dean",
    "Decker",
    "Dejesus",
    "Delacruz",
    "Delaney",
    "Deleon",
    "Delgado",
    "Delacruz",
    "Dennis",
    "Diaz",
    "Dickerson",
    "Dickson",
    "Dillard",
    "Dillon",
    "Dixon",
    "Dodson",
    "Dominguez",
    "Donald",
    "Donovan",
    "Dorsey",
    "Dotson",
    "Douglas",
    "Downs",
    "Doyle",
    "Drake",
    "Dudley",
    "Duffy",
    "Duke",
    "Duncan",
    "Dunlap",
    "Dunn",
    "Duran",
    "Durham",
    "Dyer",
    "Eaton",
    "Edwards",
    "Elliott",
    "Ellis",
    "Ellison",
    "Emerson",
    "England",
    "English",
    "Erickson",
    "Espinoza",
    "Estes",
    "Estrada",
    "Evans",
    "Everett",
    "Ewing",
    "Farley",
    "Farmer",
    "Farrell",
    "Faulkner",
    "Ferguson",
    "Fernandez",
    "Ferrell",
    "Fields",
    "Figueroa",
    "Finley",
    "Fischer",
    "Fisher",
    "Fitzgerald",
    "Fitzpatrick",
    "Fleming",
    "Fletcher",
    "Flores",
    "Flowers",
    "Floyd",
    "Flynn",
    "Foley",
    "Forbes",
    "Ford",
    "Foreman",
    "Foster",
    "Fowler",
    "Fox",
    "Francis",
    "Franco",
    "Frank",
    "Franklin",
    "Franks",
    "Frazier",
    "Frederick",
    "Freeman",
    "French",
    "Frost",
    "Fry",
    "Frye",
    "Fuentes",
    "Fuller",
    "Fulton",
    "Gaines",
    "Gallagher",
    "Gallegos",
    "Galloway",
    "Gamble",
    "Garcia",
    "Gardner",
    "Garner",
    "Garrett",
    "Garrison",
    "Garza",
    "Gates",
    "Gay",
    "Gentry",
    "George",
    "Gibbs",
    "Gibson",
    "Gilbert",
    "Giles",
    "Gill",
    "Gillespie",
    "Gilliam",
    "Gilmore",
    "Glass",
    "Glenn",
    "Glover",
    "Goff",
    "Golden",
    "Gomez",
    "Gonzales",
    "Gonzalez",
    "Good",
    "Goodman",
    "Goodwin",
    "Gordon",
    "Gould",
    "Graham",
    "Grant",
    "Graves",
    "Gray",
    "Green",
    "Greene",
    "Greer",
    "Gregory",
    "Griffin",
    "Griffith",
    "Grimes",
    "Gross",
    "Guerra",
    "Guerrero",
    "Guthrie",
    "Gutierrez",
    "Guy",
    "Guzman",
    "Hahn",
    "Hale",
    "Haley",
    "Hall",
    "Hamilton",
    "Hammond",
    "Hampton",
    "Hancock",
    "Haney",
    "Hansen",
    "Hanson",
    "Hardin",
    "Harding",
    "Hardy",
    "Harmon",
    "Harper",
    "Harrell",
    "Harrington",
    "Harris",
    "Harrison",
    "Hart",
    "Hartman",
    "Harvey",
    "Hatfield",
    "Hawkins",
    "Hayden",
    "Hayes",
    "Haynes",
    "Hays",
    "Head",
    "Heath",
    "Hebert",
    "Henderson",
    "Hendrix",
    "Henry",
    "Hensley",
    "Henson",
    "Herman",
    "Hernandez",
    "Herrera",
    "Herring",
    "Hess",
    "Hester",
    "Hewitt",
    "Hickman",
    "Hicks",
    "Higgins",
    "Hill",
    "Hines",
    "Hinton",
    "Hobbs",
    "Hodge",
    "Hodges",
    "Hoffman",
    "Hogan",
    "Holcomb",
    "Holden",
    "Holder",
    "Holland",
    "Holloway",
    "Holman",
    "Holmes",
    "Holt",
    "Hood",
    "Hooper",
    "Hoover",
    "Hopkins",
    "Hopper",
    "Horn",
    "Horne",
    "Horton",
    "House",
    "Houston",
    "Howard",
    "Howe",
    "Howell",
    "Hubbard",
    "Huber",
    "Hudson",
    "Huff",
    "Huffman",
    "Hughes",
    "Hull",
    "Humphrey",
    "Hunt",
    "Hunter",
    "Hurley",
    "Hurst",
    "Hutchinson",
    "Hyde",
    "Ingram",
    "Irwin",
    "Jackson",
    "Jacobs",
    "Jacobson",
    "James",
    "Jarvis",
    "Jefferson",
    "Jenkins",
    "Jennings",
    "Jensen",
    "Jimenez",
    "Johns",
    "Johnson",
    "Johnston",
    "Jones",
    "Jordan",
    "Joseph",
    "Joyce",
    "Joyner",
    "Juarez",
    "Justice",
    "Kane",
    "Kaufman",
    "Keith",
    "Keller",
    "Kelley",
    "Kelly",
    "Kemp",
    "Kennedy",
    "Kent",
    "Kerr",
    "Key",
    "Kidd",
    "Kim",
    "King",
    "Kinney",
    "Kirby",
    "Kirk",
    "Kirkland",
    "Klein",
    "Kline",
    "Knapp",
    "Knight",
    "Knowles",
    "Knox",
    "Koch",
    "Kramer",
    "Lamb",
    "Lambert",
    "Lancaster",
    "Landry",
    "Lane",
    "Lang",
    "Langley",
    "Lara",
    "Larsen",
    "Larson",
    "Lawrence",
    "Lawson",
    "Le",
    "Leach",
    "Leblanc",
    "Lee",
    "Leon",
    "Leonard",
    "Lester",
    "Levine",
    "Levy",
    "Lewis",
    "Lindsay",
    "Lindsey",
    "Little",
    "Livingston",
    "Lloyd",
    "Logan",
    "Long",
    "Lopez",
    "Lott",
    "Love",
    "Lowe",
    "Lowery",
    "Lucas",
    "Luna",
    "Lynch",
    "Lynn",
    "Lyons",
    "Macdonald",
    "Macias",
    "Mack",
    "Madden",
    "Maddox",
    "Maldonado",
    "Malone",
    "Mann",
    "Manning",
    "Marks",
    "Marquez",
    "Marsh",
    "Marshall",
    "Martin",
    "Martinez",
    "Mason",
    "Massey",
    "Mathews",
    "Mathis",
    "Matthews",
    "Maxwell",
    "May",
    "Mayer",
    "Maynard",
    "Mayo",
    "Mays",
    "Mcbride",
    "Mccall",
    "Mccarthy",
    "Mccarty",
    "Mcclain",
    "Mcclure",
    "Mcconnell",
    "Mccormick",
    "Mccoy",
    "Mccray",
    "Mccullough",
    "Mcdaniel",
    "Mcdonald",
    "Mcdowell",
    "Mcfadden",
    "Mcfarland",
    "Mcgee",
    "Mcgowan",
    "Mcguire",
    "Mcintosh",
    "Mcintyre",
    "Mckay",
    "Mckee",
    "Mckenzie",
    "Mckinney",
    "Mcknight",
    "Mclaughlin",
    "Mclean",
    "Mcleod",
    "Mcmahon",
    "Mcmillan",
    "Mcneil",
    "Mcpherson",
    "Meadows",
    "Medina",
    "Mejia",
    "Melendez",
    "Melton",
    "Mendez",
    "Mendoza",
    "Mercado",
    "Mercer",
    "Merrill",
    "Merritt",
    "Meyer",
    "Meyers",
    "Michael",
    "Middleton",
    "Miles",
    "Miller",
    "Mills",
    "Miranda",
    "Mitchell",
    "Molina",
    "Monroe",
    "Montgomery",
    "Montoya",
    "Moody",
    "Moon",
    "Mooney",
    "Moore",
    "Morales",
    "Moran",
    "Moreno",
    "Morgan",
    "Morin",
    "Morris",
    "Morrison",
    "Morrow",
    "Morse",
    "Morton",
    "Moses",
    "Mosley",
    "Moss",
    "Mueller",
    "Mullen",
    "Mullins",
    "Munoz",
    "Murphy",
    "Murray",
    "Myers",
    "Nash",
    "Navarro",
    "Neal",
    "Nelson",
    "Newman",
    "Newton",
    "Nguyen",
    "Nichols",
    "Nicholson",
    "Nielsen",
    "Nieves",
    "Nixon",
    "Noble",
    "Noel",
    "Nolan",
    "Norman",
    "Norris",
    "Norton",
    "Nunez",
    "Obrien",
    "Ochoa",
    "Oconnor",
    "Odom",
    "Odonnell",
    "Oliver",
    "Olsen",
    "Olson",
    "Oneal",
    "Oneil",
    "Oneill",
    "Orr",
    "Ortega",
    "Ortiz",
    "Osborn",
    "Osborne",
    "Owen",
    "Owens",
    "Pace",
    "Pacheo",
    "Padilla",
    "Page",
    "Palmer",
    "Park",
    "Parker",
    "Parks",
    "Parrish",
    "Parsons",
    "Pate",
    "Patel",
    "Patrick",
    "Patterson",
    "Patton",
    "Paul",
    "Payne",
    "Pearson",
    "Peck",
    "Pena",
    "Pennington",
    "Perez",
    "Perkins",
    "Perry",
    "Peters",
    "Petersen",
    "Peterson",
    "Petty",
    "Phelps",
    "Phillips",
    "Pickett",
    "Pierce",
    "Pittman",
    "Pitts",
    "Pollard",
    "Poole",
    "Pope",
    "Porter",
    "Potter",
    "Potts",
    "Powell",
    "Powers",
    "Pratt",
    "Preston",
    "Price",
    "Prince",
    "Pruitt",
    "Puckett",
    "Pugh",
    "Quinn",
    "Ramirez",
    "Ramos",
    "Ramsey",
    "Randall",
    "Randolph",
    "Rasmussen",
    "Ratliff",
    "Ray",
    "Raymond",
    "Reed",
    "Reese",
    "Reeves",
    "Reid",
    "Reilly",
    "Reyes",
    "Reynolds",
    "Rhodes",
    "Rice",
    "Rich",
    "Richard",
    "Richards",
    "Richardson",
    "Richmond",
    "Riddle",
    "Riggs",
    "Riley",
    "Rios",
    "Rivas",
    "Rivera",
    "Rivers",
    "Roach",
    "Robbins",
    "Roberson",
    "Roberts",
    "Robertson",
    "Robinson",
    "Robles",
    "Rocha",
    "Rodgers",
    "Rodriguez",
    "Rodriquez",
    "Rogers",
    "Rojas",
    "Rollins",
    "Roman",
    "Romero",
    "Rosa",
    "Rosales",
    "Rosario",
    "Rose",
    "Ross",
    "Roth",
    "Rowe",
    "Rowland",
    "Roy",
    "Rubio",
    "Rubin",
    "Rubio",
    "Rush",
    "Russell",
    "Russo",
    "Rutledge",
    "Ryan",
    "Salas",
    "Salazar",
    "Salinas",
    "Sampson",
    "Sanchez",
    "Sanders",
    "Sandoval",
    "Sanford",
    "Santana",
    "Santiago",
    "Santos",
    "Sargent",
    "Saunders",
    "Savage",
    "Sawyer",
    "Schmidt",
    "Schneider",
    "Schroeder",
    "Schultz",
    "Schwartz",
    "Scott",
    "Sears",
    "Sellers",
    "Serrano",
    "Sexton",
    "Shaffer",
    "Shannon",
    "Sharp",
    "Sharpe",
    "Shaw",
    "Shelton",
    "Shepard",
    "Shepherd",
    "Sheppard",
    "Sherman",
    "Shields",
    "Short",
    "Silva",
    "Simmons",
    "Simon",
    "Simpson",
    "Sims",
    "Singleton",
    "Skinner",
    "Slater",
    "Sloan",
    "Small",
    "Smith",
    "Snider",
    "Snow",
    "Snyder",
    "Solis",
    "Solomon",
    "Sosa",
    "Soto",
    "Sparks",
    "Spears",
    "Spence",
    "Spencer",
    "Stafford",
    "Stanley",
    "Stanton",
    "Stark",
    "Steele",
    "Stein",
    "Stephens",
    "Stephenson",
    "Stevens",
    "Stevenson",
    "Stewart",
    "Stokes",
    "Stone",
    "Stout",
    "Strickland",
    "Strong",
    "Stuart",
    "Suarez",
    "Sullivan",
    "Summers",
    "Sutton",
    "Swanson",
    "Sweeney",
    "Sweet",
    "Sykes",
    "Talley",
    "Tanner",
    "Tate",
    "Taylor",
    "Terrell",
    "Terry",
    "Thomas",
    "Thompson",
    "Thornton",
    "Tillman",
    "Todd",
    "Torres",
    "Townsend",
    "Tran",
    "Travis",
    "Trevino",
    "Trujillo",
    "Tucker",
    "Turner",
    "Tyler",
    "Tyson",
    "Underwood",
    "Valdez",
    "Valencia",
    "Valentine",
    "Valenzuela",
    "Vance",
    "Vang",
    "Vargas",
    "Vasquez",
    "Vaughan",
    "Vaughn",
    "Vazquez",
    "Vega",
    "Velasquez",
    "Velazquez",
    "Velez",
    "Villarreal",
    "Vincent",
    "Vinson",
    "Wade",
    "Wagner",
    "Walker",
    "Wall",
    "Wallace",
    "Waller",
    "Walls",
    "Walsh",
    "Walter",
    "Walters",
    "Walton",
    "Ward",
    "Ware",
    "Warner",
    "Warren",
    "Washington",
    "Waters",
    "Watkins",
    "Watson",
    "Watts",
    "Weaver",
    "Webb",
    "Weber",
    "Webster",
    "Weeks",
    "Weiss",
    "Welch",
    "Wells",
    "West",
    "Wheeler",
    "Whitaker",
    "White",
    "Whitehead",
    "Whitfield",
    "Whitley",
    "Whitney",
    "Wiggins",
    "Wilcox",
    "Wilder",
    "Wiley",
    "Wilkerson",
    "Wilkins",
    "Wilkinson",
    "William",
    "Williams",
    "Williamson",
    "Willis",
    "Wilson",
    "Winters",
    "Wise",
    "Witt",
    "Wolf",
    "Wolfe",
    "Wong",
    "Wood",
    "Woodard",
    "Woods",
    "Woodward",
    "Wooten",
    "Workman",
    "Wright",
    "Wyatt",
    "Wynn",
    "Yang",
    "Yates",
    "York",
    "Young",
    "Zamora",
    "Zavala",
    "Zimmerman",
  ];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

export const testJSON = (a: string) => {
  try {
    return JSON.parse(a);
  } catch {
    //
  }
};
export const extractJson = (str: string) => {
  if (!str) {
    console.error("extractJson: str is null or undefined");
    return null;
  }
  const firstOpen = str.indexOf("{");
  const firstClose = str.lastIndexOf("}");
  if (firstClose <= firstOpen) {
    return null;
  }
  const candidate = str.substring(firstOpen, firstClose + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

export const findJSON = (msg: string): string | null => {
  // first, simply test to see if it is a stringified JSON
  try {
    const test = testJSON(msg);
    if (test) {
      return test;
    }
    const jr = [msg.indexOf("{") - 1, msg.lastIndexOf("}") + 1];
    if (
      jr &&
      Array.isArray(jr) &&
      jr.length === 2 &&
      (jr[0] || 0) >= 0 &&
      (jr[1] || 0) >= 0
    ) {
      const objTest =
        jr[0] !== undefined && jr[1] !== undefined
          ? msg.substring(jr[0], jr[1])
          : "";
      const test = testJSON(objTest);
      console.info("JR_", jr, objTest, test);
      if (test) return test;
    }
    const jr1 = [msg.indexOf("{"), msg.lastIndexOf("}") + 1];
    if ((jr1[0] ?? -1) >= 0 && (jr1[1] ?? -1) >= 0) {
      const objTest = msg.substring(jr1[0] ?? 0, jr1[1] ?? 0);
      const test = testJSON(objTest);
      console.info("JR1_", jr1, objTest, test);
      if (test) return test;
    }
    const eJson = extractJson(msg);
    if (eJson) return eJson;
    return null;
  } catch {
    return null;
  }
};

import type { baseURI, IDomainInfo } from "src/interfaces";

export const createDomainInfo = (baseURIs: baseURI[]): IDomainInfo => {
  if (!baseURIs || baseURIs === undefined)
    return { services: null, region: null, zone: null };
  const region =
    baseURIs
      .find((x: baseURI) => x?.service === "leDataReporting")
      ?.baseURI?.substring(0, 2) || null;
  if (region) {
    sessionStorage.setItem("region", region);
  }
  const zone =
    baseURIs
      .find((x: baseURI) => x?.service === "accountConfigReadOnly")
      ?.baseURI?.substring(0, 2) || null;
  const services: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (const i in baseURIs) {
    if (baseURIs[i]?.service) {
      services[baseURIs[i].service] = baseURIs[i]?.baseURI;
    }
  }
  services.proactiveHandoff = `${region}.sy.handoff.liveperson.net`;
  services.convBuild = `${region}.bc-sso.liveperson.net`;
  services.bcmgmt = `${region}.bc-mgmt.liveperson.net`;
  services.bcintg = `${region}.bc-intg.liveperson.net`;
  services.bcnlu = `${region}.bc-nlu.liveperson.net`;
  services.bot = `${region}.bc-bot.liveperson.net`;
  services.botPlatform = `${region}.bc-platform.liveperson.net`;
  services.kb = `${region}.bc-kb.liveperson.net`;
  services.context = `${region}.context.liveperson.net`;
  services.recommendation = `${zone}.askmaven.liveperson.net`;
  services.idp = `${region}.idp.liveperson.net`;
  services.proactive = `proactive-messaging.${zone}.fs.liveperson.com`;
  services.maven = `${zone}.maven.liveperson.net`;

  const REDIRECT = `${location.protocol}//${location.host}/callback`;
  // if (window.location.href.includes('localhost')) {
  //   REDIRECT = `${location.protocol}//${location.host}/login`
  // }
  if (zone) {
    window.sessionStorage.setItem("zone", zone);
    // this.ZONE = zone
  }

  if (zone) {
    console.info(`REDIRECT: ${REDIRECT}`);
    window.sessionStorage.setItem("REDIRECT", REDIRECT);
  }
  return {
    services,
    region,
    zone,
  };
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const replacePlaceholders = (
  text: string,
  placeholders: Record<string, string>
) => {
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return placeholders[key] || `{${key}}`;
  });
};

export const trimJSON = (str: string) => {
  if (typeof str === "object") {
    return str;
  }
  const isJson = testJSON(str);
  if (isJson) {
    console.info("isJson", !!isJson);
    return isJson;
  }
  str = str.replace(/```json/g, "").replace(/```/g, "");
  // remove everything before and after the first and last curly braces
  const firstOpen = str.indexOf("{");
  const firstClose = str.lastIndexOf("}");
  if (firstClose <= firstOpen) {
    return null;
  }
  const candidate = str.substring(firstOpen, firstClose + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

export const ifValue = (val: string | boolean | object, fallback?: string) => {
  if (val === undefined || val === null) {
    return fallback || false;
  }
  if (typeof val === "string" && val.length === 0) {
    return fallback || false;
  }
  if (typeof val === "boolean") {
    return val;
  }
  if (Array.isArray(val) && val.length === 0) {
    return fallback || false;
  }
  if (typeof val === "object" && Object.keys(val).length === 0) {
    return fallback || false;
  }
  return val;
};

export const extractYTVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  } else {
    return null;
  }
};

export const sanitiseMessage = (message: string) => {
  /*
  identify any hyperlinks and ensure they open in new window
  */
  // Replace <a ...> tags to ensure target="_blank" and rel="noopener noreferrer"
  const withSafeLinks = message.replace(
    /<a\s+([^>]*href=['"][^'"]+['"][^>]*)>/gi,
    (match, attrs) => {
      // If target already exists, replace it; otherwise, add it
      let newAttrs = attrs.replace(/target=['"][^'"]*['"]/i, '');
      newAttrs = newAttrs.replace(/rel=['"][^'"]*['"]/i, '');
      return `<a ${newAttrs} target="_blank" rel="noopener noreferrer">`;
    }
  );
  // Remove all other HTML tags except <a>
  const onlyLinks = withSafeLinks.replace(/<(?!\/?a(?=>|\s.*>))\/?.*?>/gi, "");
  // Replace &nbsp; with space and trim
  return onlyLinks.replace(/&nbsp;/g, " ").trim();
};

export const displayArray = (arr: unknown[], maxLength: number = 3): string => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "";
  }
  if (arr.length <= maxLength) {
    return arr.join(", ");
  }
  const displayedItems = arr.slice(0, maxLength).join(", ");
  return `${displayedItems}, ... (${arr.length - maxLength} more)`;
}

export const humaniseText = (text: string): string => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
