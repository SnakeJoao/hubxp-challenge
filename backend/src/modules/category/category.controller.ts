import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Put,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() body: CreateCategoryDto) {
    try {
      return await this.categoryService.create(body);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the category.',
        error,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.categoryService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while retrieving categories.',
        error,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoryService.findOne(id);
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }
      return category;
    } catch (error) {
      throw new BadRequestException('Invalid ID format.', error);
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const updated = await this.categoryService.update(id, updateCategoryDto);
      if (!updated) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }
      return updated;
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while updating the category.',
        error,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const deleted = await this.categoryService.remove(id);
      if (!deleted) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }
      return { message: 'Category deleted successfully.' };
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while deleting the category.',
        error,
      );
    }
  }
}
