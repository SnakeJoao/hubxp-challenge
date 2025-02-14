import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from './product.dto';
import { S3Service } from '../s3/s3.service';
import type { CategoryDocument } from '../category/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    try {
      const product = new this.productModel(createProductDto);

      if (file) {
        product.imageUrl = await this.s3Service.uploadFile(file);
      }

      const savedProduct = await product.save();
      return this.toDTO(savedProduct);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the product.',
        error,
      );
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    this.validateObjectId(id);

    try {
      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }

      if (file) {
        product.imageUrl = await this.s3Service.uploadFile(file);
      }

      product.set(updateProductDto);

      const updatedProduct = await product.save();
      return this.toDTO(updatedProduct);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating the product.',
        error,
      );
    }
  }

  async findAll(): Promise<ProductResponseDto[]> {
    try {
      const products = await this.productModel
        .find()
        .populate('categories', 'name')
        .exec();
      return products.map((product) => this.toDTO(product));
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching products.',
        error,
      );
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    this.validateObjectId(id);

    const product = await this.productModel
      .findById(id)
      .populate('categories', 'name')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return this.toDTO(product);
  }

  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);

    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return { message: 'Product successfully deleted.' };
  }

  private toDTO(product: ProductDocument): ProductResponseDto {
    const categories = (
      product.categories as unknown as CategoryDocument[]
    ).map((category) => ({
      _id: category._id.toString(),
      name: category.name,
    }));

    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categories,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format.');
    }
  }
}
