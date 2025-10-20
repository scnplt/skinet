using API.DTOs;
using Core.Entities.OrderAggregate;

namespace API.Extensions;

public static class OrderMappingExtensions
{
    public static OrderDto ToDto(this Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            BuyerEmail = order.BuyerEmail,
            ShippingAddress = order.ShippingAddress,
            DeliveryMethod = order.DeliveryMethod.Description,
            ShippingPrice = order.DeliveryMethod.Price,
            PaymentSummary = order.PaymentSummary,
            OrderItems = [.. order.OrderItems.Select(orderItem => orderItem.ToDto())],
            Subtotal = order.Subtotal,
            Status = order.Status.ToString(),
            Total = order.GetTotal(),
            PaymentIntentId = order.PaymentIntentId,
        };
    }
    
    public static OrderItemDto ToDto(this OrderItem orderItem)
    {
        return new OrderItemDto
        {
            ProductId = orderItem.ItemOrdered.ProductId,
            ProductName = orderItem.ItemOrdered.ProductName,
            PictureUrl = orderItem.ItemOrdered.PictureUrl,
            Price = orderItem.Price,
            Quantity = orderItem.Quantity,
        };
    }
}
