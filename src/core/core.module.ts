import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    // Global providers go here.
  ],
  exports: [
    // Export shared providers here.
  ],
})
export class CoreModule {}
