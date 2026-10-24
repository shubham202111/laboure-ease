import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
// export class AppService implements OnModuleInit {
export class AppService  {

  // constructor(private dataSource: DataSource) {}

  // onModuleInit() {
  //   if (this.dataSource.isInitialized) {
  //     console.log('Successfully connected to the MySQL database!');
  //   } else {
  //     console.log('Failed to connect to the MySQL database.');
  //   }
  // }
  getHello(): string {
    return 'Hello World!';
  }
}
