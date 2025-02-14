import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      const category = new this.categoryModel(createCategoryDto);
      const savedCategory = await category.save();
      return this.toDTO(savedCategory);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the category.',
        error,
      );
    }
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.categoryModel.find().exec();
      return categories.map((category) => this.toDTO(category));
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching categories.',
        error,
      );
    }
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    this.validateObjectId(id);

    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return this.toDTO(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    this.validateObjectId(id);

    try {
      const category = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true, runValidators: true },
      );

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }

      return this.toDTO(category);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating the category.',
        error,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);

    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return { message: 'Category successfully deleted.' };
  }

  private toDTO(category: CategoryDocument): CategoryResponseDto {
    return {
      _id: category._id.toString(),
      name: category.name,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  }
}
