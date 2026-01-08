import { hash } from 'bcrypt';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomFill,
  scrypt,
} from 'crypto';

export const _encrypt = async (data: string): Promise<string> => {
  const algorithm = 'aes-192-cbc';
  const salt = randomBytes(8).toString('hex');

  return new Promise((resolve, reject) => {
    scrypt(process.env.SALT_TOKEN as string, salt, 24, (err, key) => {
      if (err) reject(err);

      randomFill(new Uint8Array(16), (err, iv) => {
        const ivHex = Buffer.from(iv).toString('hex');
        if (err) reject(err);

        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const result = `${salt}|${ivHex}|${encrypted}`;
        resolve(result);
      });
    });
  });
};

export const _decrypt = async (encryptedData: string): Promise<string> => {
  const algorithm = 'aes-192-cbc';

  return new Promise((resolve, reject) => {
    const [salt, ivHex, encrypted] = encryptedData.split('|');

    if (!salt || !ivHex || !encrypted) reject(new Error('Invalid data'));

    const iv = Buffer.from(ivHex, 'hex');

    scrypt(process.env.SALT_TOKEN as string, salt, 24, (err, key) => {
      if (err) reject(err);

      const decipher = createDecipheriv(algorithm, key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      resolve(decrypted);
    });
  });
};

export const encrypt = async (data: string) => {
  const encrypted = await _encrypt(data);
  const saltOrRounds = 10
  const hashed = await hash(data, saltOrRounds);

  return `${hashed}|${encrypted}`;
};

export const decrypt = async (data: string) => {
  const [_, ...rest] = data.split('|');
  const encrypted = rest.join('|');

  return await _decrypt(encrypted);
};
