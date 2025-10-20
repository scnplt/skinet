using Core.Entities.OrderAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.OwnsOne(o => o.ShippingAddress, b => b.WithOwner());
        builder.OwnsOne(o => o.PaymentSummary, b => b.WithOwner());

        builder.Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Status).HasConversion(
            status => status.ToString(),
            statusStr => (OrderStatus)Enum.Parse(typeof(OrderStatus), statusStr)
        );
        builder.Property(x => x.OrderDate).HasConversion(
            dateTime => dateTime.ToUniversalTime(),
            dateTimeUtc => DateTime.SpecifyKind(dateTimeUtc, DateTimeKind.Utc)
        );

        builder.HasMany(o => o.OrderItems).WithOne().OnDelete(DeleteBehavior.Cascade);
    }
}
