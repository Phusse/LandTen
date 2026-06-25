using BuildingBlocks.Common.Interfaces;

namespace PropertyService.Infrastructure.Services;

public class StubMediaStorageService : IMediaStorageService
{
    public Task<string> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        // For now, just return the URL passed in as a stub
        return Task.FromResult($"https://picsum.photos/seed/{Guid.NewGuid()}/800/600");
    }

    public string GetSignedUrl(string publicUrlOrPublicId, int expiresInSeconds = 3600)
    {
        // Stub: return the URL unchanged
        return publicUrlOrPublicId;
    }
}
