using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.Common.Wrappers;
using UserService.Application.Interfaces;
using UserService.Application.Dtos;
using UserService.Domain.Enums;
using UserService.Domain.Entities;

namespace UserService.Application.Commands.RefreshToken;

public record RefreshTokenResult(string AccessToken, UserDto User);

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<RefreshTokenResult>>;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<RefreshTokenResult>>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IConfiguration _configuration;

    public RefreshTokenCommandHandler(ISessionRepository sessionRepository, IConfiguration configuration)
    {
        _sessionRepository = sessionRepository;
        _configuration = configuration;
    }

    public async Task<Result<RefreshTokenResult>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken);
        
        if (session == null || session.IsExpired)
        {
            throw new ForbiddenException("Invalid or expired refresh token.");
        }

        if (session.User.Status == UserStatus.Suspended)
        {
            throw new ForbiddenException("Account is suspended.");
        }

        var accessToken = GenerateJwtToken(session.User);

        var userDto = new UserDto(
            session.User.Id,
            session.User.Email,
            session.User.UserProfile?.FirstName ?? string.Empty,
            session.User.UserProfile?.LastName ?? string.Empty,
            session.User.Role.ToString(),
            session.User.VerificationStatus.ToString(),
            session.User.CreatedAt
        );

        return Result<RefreshTokenResult>.Success(new RefreshTokenResult(accessToken, userDto));
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("role", user.Role.ToString().ToLower()),
            new Claim("verification_status", user.VerificationStatus.ToString().ToLower())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = double.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15");

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
