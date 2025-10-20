using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderSpecification : BaseSpecification<Order>
{
    public OrderSpecification(string email) : base(o => o.BuyerEmail == email)
    {
        AddInclude(o => o.OrderItems);
        AddInclude(o => o.DeliveryMethod);
        AddOrderByDescending(o => o.OrderDate);
    }

    public OrderSpecification(string email, int id) : base(o => o.BuyerEmail == email && o.Id == id)
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
    }
}
