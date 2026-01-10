import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { cache } from 'src/utils/memCache';
import { CollectionReference } from '@google-cloud/firestore';
import type { SentinelLpToken } from '@lpextend/client-sdk';

// Collection name constant
const LP_TOKENS_COLLECTION = 'lp-tokens';

interface CustomRequest extends Request {
  token?: {
    token: string;
    cbToken: string;
    cbOrg: string;
  };
  user?: any;
}

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(LP_TOKENS_COLLECTION)
    private tokenCollection: CollectionReference<SentinelLpToken>,
    private authService: AuthService,
  ) {}

  async returnIdToken (access_token: string): Promise<SentinelLpToken | null> { 
    const idToken = cache.get(access_token);
    if (idToken) {
      return idToken;
    }
    const dbItToken = await this.tokenCollection.doc(access_token).get();
    if (!!dbItToken.exists) {
      const data = dbItToken.data()
      return data;
    }

  }

  async use(req: CustomRequest, res: Response, next: () => void) {
    console.info('PreAuthMiddleware')
    try {
      const bearer = req?.headers?.authorization?.replace('Bearer ', '');
      console.info('bearer', bearer)
      if (!bearer) {
        return res.status(401).send('Unauthorized');
      }
      const idToken = await this.returnIdToken(bearer)
      console.info('idToken', idToken)
      if (!idToken) {
        return res.status(401).send('Unauthorized');
      }
      const accountId = req.params.accountId;
      
      const {
        token,
        cbToken,
        cbOrg,
        userData
      } = idToken;

      console.info(`req params accountId: ${accountId}, idToken accountId: ${accountId}`);
      if (idToken) {
        // const user = await this.accountConfigService.getOneUser(accountId, uid, bearer);
        req.user = userData;
        req.token = {
          token,
          cbToken,
          cbOrg
        }
      }
      return next()
    
    } catch (error) {
      if (error.message.includes('token has expired')) {
        return res.status(401).send(error.message);
      } else {
        return res.status(500).send(error.message);
      }
      
    }

    next();
  }
}
