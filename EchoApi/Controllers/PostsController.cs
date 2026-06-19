using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using EchoApi.Data;
using EchoApi.Hubs;
using EchoApi.Models;

namespace EchoApi.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController(EchoDbContext db, IHubContext<EchoHub> hub) : ControllerBase
{
    private string? CurrentUser => User.FindFirstValue(ClaimTypes.Name);

    // GET /api/posts?filter=feed|popular|new|top&category=webdev
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] string filter = "feed", [FromQuery] string? category = null)
    {
        var query = db.Posts
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category.ToLower() == category.ToLower());

        var posts = await query.ToListAsync();

        var sorted = filter switch
        {
            "popular" or "top" => posts.OrderByDescending(p => p.VoteScore).ToList(),
            "new"               => posts.OrderByDescending(p => p.CreatedAt).ToList(),
            _                   => posts.OrderByDescending(p => p.CreatedAt).ToList()
        };

        return Ok(sorted.Select(MapPost));
    }

    // POST /api/posts
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "Title and content are required." });

        var post = new Post
        {
            Title = req.Title.Trim(),
            Content = req.Content.Trim(),
            Category = string.IsNullOrWhiteSpace(req.Category) ? "general" : req.Category.Trim().ToLower(),
            AuthorUsername = CurrentUser!
        };

        db.Posts.Add(post);
        await db.SaveChangesAsync();

        // Reload with navigation for response
        await db.Entry(post).Collection(p => p.Votes).LoadAsync();
        await db.Entry(post).Collection(p => p.Comments).LoadAsync();

        var mapped = MapPost(post);

        // Broadcast to all connected clients
        await hub.Clients.All.SendAsync("NewPost", mapped);

        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, mapped);
    }

    // GET /api/posts/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await db.Posts
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post is null) return NotFound();

        return Ok(MapPost(post));
    }

    // POST /api/posts/{id}/vote
    [HttpPost("{id}/vote")]
    [Authorize]
    public async Task<IActionResult> Vote(int id, [FromBody] VoteRequest req)
    {
        var post = await db.Posts
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post is null) return NotFound();

        var direction = req.Direction.ToLower() == "up" ? VoteDirection.Up : VoteDirection.Down;
        var existing = post.Votes.FirstOrDefault(v => v.VoterUsername == CurrentUser);

        if (existing is not null)
        {
            if (existing.Direction == direction)
            {
                // Toggle off (un-vote)
                db.Votes.Remove(existing);
            }
            else
            {
                existing.Direction = direction;
            }
        }
        else
        {
            db.Votes.Add(new Vote { PostId = id, VoterUsername = CurrentUser!, Direction = direction });

            // Create notification for post author (not for self-votes)
            if (post.AuthorUsername != CurrentUser)
            {
                db.Notifications.Add(new Notification
                {
                    TargetUsername = post.AuthorUsername,
                    ActorUsername = CurrentUser!,
                    Type = direction == VoteDirection.Up ? NotificationType.Upvote : NotificationType.Downvote,
                    PostId = post.Id,
                    PostTitle = post.Title
                });
            }
        }

        await db.SaveChangesAsync();

        // Reload votes and broadcast updated score
        await db.Entry(post).Collection(p => p.Votes).LoadAsync();
        var newScore = post.VoteScore;

        await hub.Clients.All.SendAsync("VoteUpdate", new { postId = id, voteScore = newScore });

        return Ok(new { postId = id, voteScore = newScore });
    }

    private static object MapPost(Post p) => new
    {
        id = p.Id.ToString(),
        title = p.Title,
        content = p.Content,
        author = p.AuthorUsername,
        votes = p.VoteScore,
        commentCount = p.CommentCount,
        category = p.Category,
        createdAt = FormatDate(p.CreatedAt)
    };

    private static string FormatDate(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "just now";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} mins ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hours ago";
        if (diff.TotalDays < 7) return $"{(int)diff.TotalDays} days ago";
        return dt.ToString("MMM d, yyyy");
    }

    public record CreatePostRequest(string Title, string Content, string? Category);
    public record VoteRequest(string Direction);
}
