/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsUUID,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  products: string[];

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class OrderResponseDto {
  @IsUUID()
  _id: string;

  @IsDate()
  date: Date;

  @IsNumber()
  total: number;

  products: {
    _id: string;
    name: string;
  }[];
}
