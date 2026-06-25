namespace BuildingBlocks.Common.Interfaces;

public interface IMediaStorageService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
    string GetSignedUrl(string publicUrlOrPublicId, int expiresInSeconds = 3600);
}
