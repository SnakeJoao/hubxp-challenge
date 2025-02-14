import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsMongoId,
  ArrayUnique,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsNotEmpty({ message: 'The product name is required.' })
  @IsString({ message: 'The product name must be a string.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'The description must be a string.' })
  description?: string;

  @IsNotEmpty({ message: 'The price is required.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'The price must be a number.' })
  @Min(0, { message: 'The price cannot be negative.' })
  price: number;

  @IsOptional()
  @IsArray({ message: 'Categories must be an array.' })
  @ArrayUnique({ message: 'Categories cannot contain duplicate IDs.' })
  @IsMongoId({ each: true, message: 'Each category must be a valid ID.' })
  categories?: string[];

  @IsOptional()
  @IsString({ message: 'The image URL must be a string.' })
  imageUrl?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductResponseDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  categories: {
    _id: string;
    name: string;
  }[];
}
