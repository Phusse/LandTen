using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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

namespace UserService.Application.Commands.Login;

public record LoginResult(string AccessToken, string RefreshToken, UserDto User);

public record LoginCommand(string Email, string Password, string DeviceInfo, string IpAddress) : IRequest<Result<LoginResult>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResult>>
{
    private readonly IUserRepository _userRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IAdminActionLogRepository _adminActionLogRepository;
    private readonly IConfiguration _configuration;

    public LoginCommandHandler(IUserRepository userRepository, ISessionRepository sessionRepository, IAdminActionLogRepository adminActionLogRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _sessionRepository = sessionRepository;
        _adminActionLogRepository = adminActionLogRepository;
        _configuration = configuration;
    }

    public async Task<Result<LoginResult>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new ForbiddenException("Invalid email or password.");
        }

        if (user.Status == UserStatus.Suspended)
        {
            var reason = await _adminActionLogRepository.GetLastSuspensionReasonAsync(user.Id, cancellationToken);
            var detail = string.IsNullOrWhiteSpace(reason)
                ? "Your account has been suspended. Please contact support if you believe this is an error."
                : $"Your account has been suspended. Reason: {reason}. If you believe this is a mistake, please contact support.";
            throw new ForbiddenException(detail);
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        var session = new Session
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            DeviceInfo = request.DeviceInfo,
            IpAddress = request.IpAddress,
            ExpiresAt = DateTime.UtcNow.AddDays(double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7"))
        };

        await _sessionRepository.AddAsync(session, cancellationToken);
        await _sessionRepository.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.UserProfile?.FirstName ?? string.Empty,
            user.UserProfile?.LastName ?? string.Empty,
            user.Role.ToString(),
            user.VerificationStatus.ToString(),
            user.CreatedAt
        );

        return Result<LoginResult>.Success(new LoginResult(accessToken, refreshToken, userDto));
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

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
