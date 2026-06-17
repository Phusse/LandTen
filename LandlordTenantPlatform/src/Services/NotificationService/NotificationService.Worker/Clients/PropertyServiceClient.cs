using System.Text.Json;

namespace NotificationService.Worker.Clients;

public interface IPropertyServiceClient
{
    Task<PropertyResponse?> GetPropertyAsync(Guid propertyId);
}

public record PropertyResponse(Guid PropertyId, Guid LandlordId, string Status);

public class PropertyServiceClient : IPropertyServiceClient
{
    private readonly HttpClient _httpClient;

    public PropertyServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PropertyResponse?> GetPropertyAsync(Guid propertyId)
    {
        var response = await _httpClient.GetAsync($"/properties/{propertyId}");
        if (!response.IsSuccessStatusCode)
            return null;

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<PropertyResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}
