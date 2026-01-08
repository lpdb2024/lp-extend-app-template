import { Injectable } from '@nestjs/common';

import { FirebaseRepository } from './firebase.repository';

@Injectable()
export class PostsService {
  constructor(private firebaseRepository: FirebaseRepository) {}
}
