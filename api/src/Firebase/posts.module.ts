import { Module } from '@nestjs/common';

import { FirebaseModule } from './firebase.module';

// import { PostsService } from './posts.service';

@Module({
  imports: [FirebaseModule],
  controllers: [],
  providers: [],
})
export class PostsModule {}
