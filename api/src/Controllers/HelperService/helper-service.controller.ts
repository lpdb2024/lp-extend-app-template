import { Controller, Get, Delete, Param } from '@nestjs/common';
import { HelperService } from './helper-service.service'

import { API_ROUTES } from '../../constants/constants';
import {
  BaseUriDto
} from './helper-service.interfaces.dto';

@Controller(API_ROUTES.ACCOUNT())
export class HelperController {
  constructor(private service: HelperService) {}

  @Get('/:accountId/domains')
  async getDomains(
    @Param('accountId') accountId: string
  ): Promise<BaseUriDto[]> | null {
    return this.service.getDomains(accountId);
  }

  @Get('/:accountId/domains/:service')
  async getDomain(
    @Param('accountId') accountId: string,
    @Param('service') service: string
  ): Promise<string> | null {
    return this.service.getDomain(accountId, service);
  }

  @Delete('/:accountId/domains/cache')
  async clearDomainCache(
    @Param('accountId') accountId: string
  ): Promise<{ success: boolean; message: string }> {
    this.service.clearDomainCache(accountId);
    return { success: true, message: `Domain cache cleared for account ${accountId}` };
  }
}
