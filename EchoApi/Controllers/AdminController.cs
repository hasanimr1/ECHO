using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace EchoApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController(IConfiguration config) : ControllerBase
{
    /**
     * SECURE DATABASE EXPORT
     * Allows downloading the echo.db file for manual inspection.
     * Required header: X-Admin-Key
     */
    [HttpGet("db-download")]
    public IActionResult DownloadDatabase()
    {
        var requestedKey = Request.Headers["X-Admin-Key"].ToString();
        var secureKey = config["AdminKey"] ?? "echo-default-key-change-me";

        if (string.IsNullOrEmpty(requestedKey) || requestedKey != secureKey)
            return Unauthorized(new { message = "Access denied. Valid X-Admin-Key header required." });

        // Extract file path from connection string: "Data Source=/data/echo.db" -> "/data/echo.db"
        var connStr = config.GetConnectionString("DefaultConnection") ?? "Data Source=echo.db";
        var dbPath = connStr.Replace("Data Source=", "").Trim();

        if (!System.IO.File.Exists(dbPath))
            return NotFound(new { message = $"Database file not found at {dbPath}" });

        var fileBytes = System.IO.File.ReadAllBytes(dbPath);
        return File(fileBytes, "application/octet-stream", "echo_production.db");
    }
}
