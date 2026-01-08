import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { helper } from 'src/utils/HelperService'
import axios from 'axios'
import * as path from 'path'
import * as fs from 'fs'
import * as fsAsync from 'node:fs/promises';
// import * as webp from 'webp-converter'
import { ConfigService } from '@nestjs/config';
import { GOOGLE_ASSETS_FOLDER } from 'src/constants/constants';
@Injectable()
export class GoogleStorageService {  
  
  private logger: Logger = new Logger(GoogleStorageService.name);
  private configService: ConfigService = new ConfigService()

  constructor(
  ) {}

  async uploadFile (ctx: any, bucketName: string, filePath: string, destination: string) {
    try {
      // const prefix = `${GOOGLE_ASSETS_FOLDER}`
      // const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
      const storage = new Storage()
      const result = await storage.bucket(bucketName).upload(filePath, {
        destination
      })
      const { name, bucket } = result[0].metadata
      const str = `${bucket}/${name}`
      return `https://storage.googleapis.com/${str}`
    } catch (error) {
      ctx.logger.error(error)
      throw new InternalServerErrorException(error)      
    }
  }
  async getImage (url: string) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    })
    return response.data
  }
  async downloadFile (fileUrl: string, filename: string, ext?: string): Promise<string> {
    const folder = 'folder' // path.join(__dirname, 'files')
    console.info(__dirname, 'folder', 'folder')
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }
    const localFP = `${folder}/${filename}${ext || ''}`
    console.log(`downloading file to ${localFP}`)
    const writer = fs.createWriteStream(localFP)

    const localFile: string | null = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    }).then(response => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer)
        let error = null
        writer.on('error', err => {
          error = err
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          if (!error) {
            resolve(localFP)
          }
        })
      })
    })
    console.info('localFile', localFile, typeof localFile)
    return localFile
  }
  async downloadImageByURLOld (
    url: string,
    filename: string,
    brandName: string,
    accountId: string
  ): Promise<any> {
    console.info(url, filename, brandName, accountId)
    const localFile: string = await this.downloadFile(url, filename)

    const bucket_name = process.env.GOOGLE_PUBLIC_FOLDER
    
    const name = filename.replace(/ /g, '_').replace(/\./g, '_').replace(/\//g, '').replace(/\\/g, '').replace(/:/g, '')
    const name1 = name.replace(/[^a-zA-Z0-9]*/g, '').replace(/%20/g, '').replace(/\?/g, '').replace(/&/g, '')
    const path = `${accountId}/${brandName}/${name1}`
    const destination_url = await this.uploadLocalFile(this, bucket_name, localFile, `${path}.png`)
    
    return { url: destination_url }
  }
  async downloadImageByURL (
    url: string,
    filename: string,
    brandName: string,
    accountId: string
  ) {
    // download file from URL, and without saving locally, upload to google storage
    const response = await axios.get(url, { responseType: 'stream' });
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER');
    const storage = new Storage();
    const bucket = storage.bucket(bucket_name);

    const name = filename.replace(/ /g, '_').replace(/\./g, '_').replace(/\//g, '').replace(/\\/g, '').replace(/:/g, '');
    const sanitizedName = name.replace(/[^a-zA-Z0-9]*/g, '').replace(/%20/g, '').replace(/\?/g, '').replace(/&/g, '');
    const path = `${accountId}/${brandName}/${sanitizedName}.png`;

    const file = bucket.file(path);
    const stream = file.createWriteStream({
      metadata: {
      contentType: response.headers['content-type'],
      },
    });

    return new Promise((resolve, reject) => {
      response.data
      .pipe(stream)
      .on('error', (err) => {
        reject(err);
      })
      .on('finish', () => {
        resolve({
          url: `https://storage.googleapis.com/${bucket_name}/${path}`
        });
      });
    });
  }

  async searchGoogleWebImages (query: string, queryString: string, _iterations?: number): Promise<any[]> | null {
    // search google images using google custom search API
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY')
    const searchEngineId = this.configService.get<string>('GOOGLE_SEARCH_ENGINE_ID')  
    const results = []
    const iterations = _iterations || 2
    let start = 1
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&q=${query}&searchType=image&num=10&start=${start}${queryString ? `&${queryString}` : ''}`
    // call the url * iterations times and add the results to the results array
    
    for (let i = 0; i < iterations; i++) {
      
      // console.info('url', url)
      const response = await axios.get(url)
      start += 10
      // console.info('response', response.data)
      results.push(...response.data.items)
    }
    console.info('results', results)
    return results
  }

  async searchGoogleWeb (query: string): Promise<any[]> | null {
    // search google images using google custom search API
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY')
    const searchEngineId = this.configService.get<string>('GOOGLE_SEARCH_ENGINE_ID')  
    const results = []
    const iterations = 1
    let start = 1
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=10&start=${start}`
    // call the url * iterations times and add the results to the results array
    
    for (let i = 0; i < iterations; i++) {
      
      console.info('url', url)
      const response = await axios.get(url)
      start += 10
      console.info('response', response.data)
      results.push(...response.data.items)
    }
    console.info('results', results)
    return results
  }

  async getImages(): Promise<string[]> | null {
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
    
    const prefix = `${GOOGLE_ASSETS_FOLDER}`
    const storage = new Storage();
    // await storage.bucket(bucket_name).setCorsConfiguration([]);
    const [files] = await storage.bucket(bucket_name).getFiles({ prefix });
    const fileUrls = []
    files.forEach(file => {
      fileUrls.push(`https://storage.googleapis.com/${bucket_name}/${file.name}`)
    });
    return fileUrls
  }
  async getAppAssets(): Promise<string[]> | null {
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
    console.info('** bucket name', bucket_name)
    

    const path = `${GOOGLE_ASSETS_FOLDER}`

    const storage = new Storage();
    const [files] = await storage.bucket(bucket_name).getFiles({ prefix: path });
    // const setCORS = await storage.bucket(bucket_name).setCorsConfiguration([]);
    const maxAgeSeconds = 3600;
    const method = 'GET'
    const responseHeader = 'Access-Control-Allow-Origin';
    const origin = '*';
    const setCORS = await storage.bucket(bucket_name).setCorsConfiguration([
        {
          maxAgeSeconds,
          method: [method],
          origin: [origin],
          responseHeader: [responseHeader],
        },
      ]);

      console.log(`Bucket ${bucket_name} was updated with a CORS config
          to allow ${method} requests from ${origin} sharing 
          ${responseHeader} responses across origins`);

    // console.info('** CORS', bucket_name, setCORS)
    // console.info(files)
    const fileUrls = []
    files.forEach(file => {
      fileUrls.push({
        name: file.name,
        url: `https://storage.googleapis.com/${bucket_name}/${file.name}`
      })
    });
    return fileUrls
  }
  
  async listBlobsWithBrandName(accountId: string, prefix: string, delimiter: string | null): Promise<any[]> | null {
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER');

    const path = `accounts/${accountId}/${prefix}`
    // const localFP = `accounts/${folder}/${filename || 'file'}`

    const storage = new Storage();
    const [files] = await storage.bucket(bucket_name).getFiles({ prefix: path, delimiter });
    // console.info(files)
    const fileUrls = []
    files.forEach(file => {
      const name = file.name.includes('/') ? file.name.split('/').pop() : file.name
      fileUrls.push({
        name,
        url: `https://storage.googleapis.com/${bucket_name}/${file.name}`
      })
    });
    return fileUrls    
  }
  async convertToWebP (ctx: any, localFile: string) { 
    console.info('localFile', localFile)
    const ext = helper.getFileExt(localFile) ? helper.getFileExt(localFile) : ''
    if (ext === '.webp') return localFile
    const newName = localFile.replace(/\.[^/.]+$/, '.png')
    // await webp.cwebp(localFile, newName, '-q 80')
    return newName
  }
  async uploadLocalFile (ctx: any, bucketName: string, localFile: string, destination: string) {    
    // const converted = await this.convertToWebP(ctx, localFile)
    const outcome = fsAsync.readFile(localFile)
    .then(async (data) => {
      this.logger.log(`1 read file ${localFile}`)
      console.info(destination)
      const url = await this.uploadFile(this, bucketName, localFile, destination)

      this.logger.log(`uploaded file to ${url}`)
      return url
    })
    return outcome
  }

  // async uploadFileToStorage (files: any, accountId: string, bucket: string, destfolder: string) {

  //   const folder = path.join(__dirname, 'files')
  //   if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }

  //   const urls = []

  //   console.info('files', files.length)

  //   // const name = filename.replace(/ /g, '_').replace(/\./g, '_').replace(/\//g, '').replace(/\\/g, '').replace(/:/g, '')
    

  //   for (const file of files) {
  //     const name1 = file.originalname.replace(/[^a-zA-Z0-9]*/g, '').replace(/%20/g, '').replace(/\?/g, '').replace(/&/g, '')
  //     const gpath = `${accountId}/${brandName}/${name1}`
      
  //     const localFP = `${folder}/${file.originalname}`
  //     const writer = fs.createWriteStream(localFP)
  //     writer.write(file.buffer)
  //     const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')

  //     // const destination = `${accountId}/${brandName}/${name1}`
  //     const destination_url = await this.uploadLocalFile(this, bucket_name, localFP, `${gpath}.webp`)

  //     // return { url: destination_url }

  //     // const url = await this.uploadFile(this, bucket_name, localFP, destination)
  //     urls.push({
  //       name: name1,
  //       url: destination_url
  //     })
  //   }

  //   return urls
    
  // }

  async uploadFileToBrandStorage (files: any, accountId: string, brandName: string) {

    const folder = path.join(__dirname, 'files')
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }

    const urls = []

    console.info('files', files.length)

    // const name = filename.replace(/ /g, '_').replace(/\./g, '_').replace(/\//g, '').replace(/\\/g, '').replace(/:/g, '')
    

    for (const file of files) {
      const name1 = file.originalname.replace(/[^a-zA-Z0-9]*/g, '').replace(/%20/g, '').replace(/\?/g, '').replace(/&/g, '')
      const gpath = `accounts/${accountId}/${brandName}/${name1}`
      
      const localFP = `${folder}/${file.originalname}`
      const writer = fs.createWriteStream(localFP)
      writer.write(file.buffer)
      const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')

      // const destination = `${accountId}/${brandName}/${name1}`
      const destination_url = await this.uploadLocalFile(this, bucket_name, localFP, `${gpath}.png`)

      // return { url: destination_url }

      // const url = await this.uploadFile(this, bucket_name, localFP, destination)
      urls.push({
        name: name1,
        url: destination_url
      })
    }

    return urls
    
  }

  async uploadBase64ToStorage (base64: string, pathname: string, name: string) {
    console.info(base64, pathname, name)
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const filename = name.replace(/\.[^/.]+$/, '.png')
    const folder = path.join(__dirname, 'files')
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }
    const localFP = `${folder}/${filename || 'file'}`
    fs.writeFileSync(localFP, base64Data, 'base64')
    const gpath = `${pathname}/${filename}.png`
    const destination_url = await this.uploadLocalFile(this, bucket_name, localFP, `${gpath}`)
    fs.unlinkSync(localFP);
    return destination_url
  }

  async uploadBase64 (base64: string, accountId: string, brandName: string, name: string) {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const filename = name.replace(/\.[^/.]+$/, '.png')
    const folder = path.join(__dirname, 'files')
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }
    const localFP = `${folder}/${filename || 'file'}`
    fs.writeFileSync(localFP, base64Data, 'base64')
    const bucket_name = this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
    const gpath = `accounts/${accountId}/${brandName}/${filename}`
    const destination_url = await this.uploadLocalFile(this, bucket_name, localFP, `${gpath}`)
    return destination_url
  }

  async returnBase64FromImageUrl (url: string) {
    return axios.get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => {
      return Buffer.from(response.data).toString('base64')
    })
  }
  async removeFile (f: string, b?: string) {
    const bucket_name = b || this.configService.get<string>('GOOGLE_PUBLIC_FOLDER')
    const filename = f.replace(`${bucket_name}/`, '')
    // fileUrls.push(`https://storage.googleapis.com/${bucket_name}/${file.name}`)
    // const fullFileName = `${bucket_name}/${filename}`
    // console.info('fullFileName', fullFileName)
    const storage = new Storage()
    const file = storage.bucket(bucket_name).file(filename)
    return file.delete()
  }

}
