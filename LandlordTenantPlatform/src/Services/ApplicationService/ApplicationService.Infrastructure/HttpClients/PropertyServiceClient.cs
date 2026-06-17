using System.Net.Http.Json;
using BuildingBlocks.Common.Wrappers;
using ApplicationService.Application.Interfaces;

namespace ApplicationService.Infrastructure.HttpClients;

public class PropertyServiceClient : IPropertyServiceClient
{
    private readonly HttpClient _httpClient;

    public PropertyServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PropertyDto?> GetPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/properties/{propertyId}", cancellationToken);
        if (!response.IsSuccessStatusCode) return null;

        var result = await response.Content.ReadFromJsonAsync<PropertyDto>(cancellationToken: cancellationToken);
        return result;
    }

    public async Task<List<Guid>> GetPropertiesByLandlordAsync(Guid landlordId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/properties/landlord/{landlordId}", cancellationToken);
        if (!response.IsSuccessStatusCode) return new List<Guid>();

        var result = await response.Content.ReadFromJsonAsync<PaginatedList<PropertyDto>>(cancellationToken: cancellationToken);
        return result?.Items.Select(p => p.Id).ToList() ?? new List<Guid>();
    }
}
