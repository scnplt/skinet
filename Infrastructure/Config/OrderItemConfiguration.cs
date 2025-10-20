using Core.Entities.OrderAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.OwnsOne(orderItem => orderItem.ItemOrdered, b => b.WithOwner());
        builder.Property(orderItem => orderItem.Price).HasColumnType("decimal(18,2)");
    }
}
