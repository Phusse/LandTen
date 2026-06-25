using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using BuildingBlocks.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace BuildingBlocks.Common.Services;

public class CloudinarySettings
{
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}

public class CloudinaryMediaStorageService : IMediaStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaStorageService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret);

        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        UploadResult uploadResult;

        if (ext == ".pdf")
        {
            // Upload PDFs as raw files with public access
            var uploadParams = new RawUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                AccessMode = "public",
                Type = "upload",
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }
        else
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                AccessMode = "public",
                Type = "upload",
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
        }
        
        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public string GetSignedUrl(string publicUrlOrPublicId, int expiresInSeconds = 3600)
    {
        // Extract public ID from a full Cloudinary URL if needed
        // e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/file.pdf -> folder/file.pdf (no ext)
        string publicId = publicUrlOrPublicId;

        if (publicUrlOrPublicId.StartsWith("http"))
        {
            // Pattern: .../upload/v<version>/<publicId>
            var uploadToken = "/upload/";
            var idx = publicUrlOrPublicId.IndexOf(uploadToken, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                var afterUpload = publicUrlOrPublicId[(idx + uploadToken.Length)..];
                // Strip version segment if present (v12345/)
                if (afterUpload.StartsWith("v") && afterUpload.Contains('/'))
                {
                    var versionEnd = afterUpload.IndexOf('/');
                    afterUpload = afterUpload[(versionEnd + 1)..];
                }
                publicId = Path.GetFileNameWithoutExtension(afterUpload);
                // Preserve subfolder if any
                var lastSlash = afterUpload.LastIndexOf('/');
                if (lastSlash >= 0)
                    publicId = afterUpload[..lastSlash] + "/" + Path.GetFileNameWithoutExtension(afterUpload[(lastSlash + 1)..]);
            }
        }

        var expires = DateTimeOffset.UtcNow.AddSeconds(expiresInSeconds).ToUnixTimeSeconds();
        var signedUrl = _cloudinary.Api.UrlImgUp
            .Secure(true)
            .Signed(true)
            .BuildUrl(publicId);

        return signedUrl;
    }
}
