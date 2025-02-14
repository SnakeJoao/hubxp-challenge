import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../order/order.schema';
import { Product, ProductDocument } from '../product/product.schema';

export interface SalesMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByDate: { _id: string; ordersPerDate: number }[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getSalesMetrics(
    categoryIds?: string[],
    productIds?: string[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesMetrics> {
    const match: Record<string, any> = {
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { $gte: startDate } : {}),
              ...(endDate ? { $lte: endDate } : {}),
            },
          }
        : {}),
      ...(productIds?.length
        ? { products: { $in: productIds.map((id) => new Types.ObjectId(id)) } }
        : {}),
    };

    if (categoryIds?.length) {
      const categoryProducts = await this.productModel
        .find(
          {
            categories: {
              $in: categoryIds.map((id) => new Types.ObjectId(id)),
            },
          },
          '_id',
        )
        .lean()
        .exec();

      const filteredProductIds = categoryProducts.map((product) => product._id);

      if (filteredProductIds.length) {
        const existingProducts = match.products as { $in: Types.ObjectId[] };
        match.products = {
          $in: [
            ...new Set(
              existingProducts
                ? [...existingProducts.$in, ...filteredProductIds]
                : filteredProductIds,
            ),
          ],
        };
      }
    }

    interface AggregationResult {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersByDate: { _id: string; ordersPerDate: number }[];
    }

    const [metrics] = await this.orderModel.aggregate<AggregationResult>([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      },
      {
        $lookup: {
          from: 'orders',
          pipeline: [
            { $match: match },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                ordersPerDate: { $sum: 1 },
              },
            },
          ],
          as: 'ordersByDate',
        },
      },
    ]);

    return {
      totalOrders: metrics?.totalOrders || 0,
      totalRevenue: metrics?.totalRevenue || 0,
      averageOrderValue: metrics?.averageOrderValue || 0,
      ordersByDate: metrics?.ordersByDate || [],
    };
  }
}
