using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using EchoApi.Data;
using EchoApi.Models;

namespace EchoApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(EchoDbContext db, IConfiguration config) : ControllerBase
{
    public record SignupRequest(string Username, string Password, string DisplayName);
    public record LoginRequest(string Username, string Password);

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { success = false, message = "Username and password are required." });

        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return BadRequest(new { success = false, message = "Username already exists." });

        var account = new AppUser
        {
            Username = req.Username.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? req.Username : req.DisplayName.Trim(),
            Avatar = (string.IsNullOrWhiteSpace(req.DisplayName) ? req.Username : req.DisplayName).Substring(0, 1).ToUpper()
        };

        db.Users.Add(account);
        await db.SaveChangesAsync();

        return Ok(new { success = true, message = "Identity created. Please log in." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var account = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);

        if (account is null || !BCrypt.Net.BCrypt.Verify(req.Password, account.PasswordHash))
            return Unauthorized(new { success = false, message = "Invalid credentials." });

        var token = GenerateJwt(account);

        return Ok(new
        {
            success = true,
            token,
            user = new { account.Id, account.Username, account.DisplayName, account.Avatar }
        });
    }

    private string GenerateJwt(AppUser account)
    {
        var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Name, account.Username),
            new Claim("displayName", account.DisplayName),
            new Claim("avatar", account.Avatar)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
