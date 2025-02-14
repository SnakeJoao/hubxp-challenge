import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }],
    required: true,
  })
  products: Types.ObjectId[];

  @Prop({ required: true, min: 0 })
  total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
