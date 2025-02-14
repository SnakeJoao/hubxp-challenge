import {
  Controller,
  Get,
  Query,
  ParseArrayPipe,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('sales-metrics')
  async getSalesMetrics(
    @Query('categoryIds', new ParseArrayPipe({ items: String, optional: true }))
    categoryIds?: string[],
    @Query('productIds', new ParseArrayPipe({ items: String, optional: true }))
    productIds?: string[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedStartDate = this.parseDate(startDate, 'startDate');
    const parsedEndDate = this.parseDate(endDate, 'endDate');

    return this.dashboardService.getSalesMetrics(
      categoryIds,
      productIds,
      parsedStartDate,
      parsedEndDate,
    );
  }

  private parseDate(dateString?: string, paramName?: string): Date | undefined {
    if (!dateString) return undefined;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `Invalid date format for ${paramName}. Expected format: YYYY-MM-DD.`,
      );
    }
    return date;
  }
}
