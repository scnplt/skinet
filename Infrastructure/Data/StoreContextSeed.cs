using System.Text.Json;
using Core.Entities;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context)
    {
        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");
            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products != null)
            {
                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
        }

        if (!context.DeliveryMethods.Any())
        {
            var data = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/delivery.json");
            var methods = JsonSerializer.Deserialize<List<DeliveryMethod>>(data);

            if (methods != null)
            {
                context.DeliveryMethods.AddRange(methods);
                await context.SaveChangesAsync();
            }
        }
    }
}
