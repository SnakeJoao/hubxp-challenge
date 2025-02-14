import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from './order.dto';
import type { ProductDocument } from '../product/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      const createdOrder = new this.orderModel(createOrderDto);
      const savedOrder = await createdOrder.save();
      return this.toDTO(savedOrder);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the order.',
        error,
      );
    }
  }

  async findAll(): Promise<OrderResponseDto[]> {
    try {
      const orders = await this.orderModel
        .find()
        .populate('products', 'name')
        .exec();
      return orders.map((order) => this.toDTO(order));
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching orders.',
        error,
      );
    }
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    this.validateObjectId(id);

    const order = await this.orderModel
      .findById(id)
      .populate('products')
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return this.toDTO(order);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    this.validateObjectId(id);

    try {
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(id, updateOrderDto, {
          new: true,
          runValidators: true,
        })
        .populate('products')
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      return this.toDTO(updatedOrder);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating the order.',
        error,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);

    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return { message: 'Order successfully deleted.' };
  }

  private toDTO(order: OrderDocument): OrderResponseDto {
    const products = (order.products as unknown as ProductDocument[]).map(
      (product) => ({
        _id: product._id.toString(),
        name: product.name,
      }),
    );

    return {
      _id: order._id.toString(),
      date: order.date,
      total: order.total,
      products,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid order ID format.');
    }
  }
}
