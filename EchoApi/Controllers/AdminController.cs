using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EchoApi.Data;
using System;
using System.IO;
using System.Threading.Tasks;

namespace EchoApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController(EchoDbContext db, IConfiguration config) : ControllerBase
{
    /**
     * SECURE DATABASE EXPORT
     * Allows downloading a consistent backup of the echo.db file.
     * Uses VACUUM INTO to ensure all WAL data is flushed into the copy.
     */
    [HttpGet("db-download")]
    public async Task<IActionResult> DownloadDatabase([FromQuery] string? key)
    {
        var requestedKey = key ?? Request.Headers["X-Admin-Key"].ToString();
        var secureKey = config["AdminKey"] ?? "echo-default-key-change-me";

        if (string.IsNullOrEmpty(requestedKey) || requestedKey != secureKey)
            return Unauthorized(new { message = "Access denied. Valid X-Admin-Key header required." });

        var tempPath = Path.Combine(Path.GetTempPath(), $"echo_backup_{Guid.NewGuid()}.db");

        try
        {
            // VACUUM INTO creates a new, consistent database file from the current state
            await db.Database.ExecuteSqlRawAsync($"VACUUM INTO '{tempPath}'");

            var fileBytes = await System.IO.File.ReadAllBytesAsync(tempPath);
            return File(fileBytes, "application/octet-stream", "echo_production.db");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating database backup", details = ex.Message });
        }
        finally
        {
            if (System.IO.File.Exists(tempPath))
                System.IO.File.Delete(tempPath);
        }
    }
}
