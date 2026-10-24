import { PartialType } from '@nestjs/mapped-types';
import { CreateUserSiteDto } from './create-user-site.dto.js';

export class UpdateUserSiteDto extends PartialType(CreateUserSiteDto) {}
