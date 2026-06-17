using System.Text.Json;

namespace NotificationService.Worker.Clients;

public interface IUserServiceClient
{
    Task<UserResponse?> GetUserAsync(Guid userId);
}

public record UserResponse(Guid Id, string Email, string FirstName, string LastName, string PhoneNumber);

public class UserServiceClient : IUserServiceClient
{
    private readonly HttpClient _httpClient;

    public UserServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<UserResponse?> GetUserAsync(Guid userId)
    {
        var response = await _httpClient.GetAsync($"/users/{userId}");
        if (!response.IsSuccessStatusCode)
            return null;

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<UserResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}
