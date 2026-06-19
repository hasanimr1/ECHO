using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EchoApi.Data;

namespace EchoApi.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(EchoDbContext db) : ControllerBase
{
    private string CurrentUser => User.FindFirstValue(ClaimTypes.Name)!;

    // GET /api/notifications
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = await db.Notifications
            .Where(n => n.TargetUsername == CurrentUser)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notifications.Select(n => new
        {
            id = n.Id.ToString(),
            type = n.Type.ToString().ToLower(),
            postId = n.PostId.ToString(),
            postTitle = n.PostTitle,
            commenterUsername = n.ActorUsername,
            read = n.IsRead,
            createdAt = FormatDate(n.CreatedAt)
        }));
    }

    // GET /api/notifications/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var count = await db.Notifications
            .CountAsync(n => n.TargetUsername == CurrentUser && !n.IsRead);

        return Ok(new { count });
    }

    // POST /api/notifications/read
    [HttpPost("read")]
    public async Task<IActionResult> MarkAllRead()
    {
        await db.Notifications
            .Where(n => n.TargetUsername == CurrentUser && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

        return Ok(new { success = true });
    }

    private static string FormatDate(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "just now";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} mins ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hours ago";
        return dt.ToString("MMM d, yyyy");
    }
}
