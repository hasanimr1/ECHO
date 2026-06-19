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
[Route("api/posts/{postId}/comments")]
public class CommentsController(EchoDbContext db, IHubContext<EchoHub> hub) : ControllerBase
{
    private string? CurrentUser => User.FindFirstValue(ClaimTypes.Name);

    // GET /api/posts/{postId}/comments
    [HttpGet]
    public async Task<IActionResult> GetComments(int postId)
    {
        var comments = await db.Comments
            .Where(c => c.PostId == postId && c.ParentCommentId == null)
            .Include(c => c.Replies)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(comments.Select(c => MapComment(c, includeReplies: true)));
    }

    // POST /api/posts/{postId}/comments
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddComment(int postId, [FromBody] AddCommentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "Comment content is required." });

        var post = await db.Posts.FindAsync(postId);
        if (post is null) return NotFound(new { message = "Post not found." });

        var comment = new Comment
        {
            PostId = postId,
            AuthorUsername = CurrentUser!,
            Content = req.Content.Trim(),
            ParentCommentId = req.ParentCommentId
        };

        db.Comments.Add(comment);

        // Notify the post author (not for self-comments)
        if (post.AuthorUsername != CurrentUser)
        {
            db.Notifications.Add(new Notification
            {
                TargetUsername = post.AuthorUsername,
                ActorUsername = CurrentUser!,
                Type = NotificationType.Comment,
                PostId = post.Id,
                PostTitle = post.Title
            });
        }

        await db.SaveChangesAsync();

        var mapped = MapComment(comment, includeReplies: false);

        // Broadcast to all users watching this post group
        await hub.Clients.Group($"post-{postId}").SendAsync("NewComment", mapped);
        // Also notify everyone about the comment count change
        await hub.Clients.All.SendAsync("CommentCountUpdate", new { postId, commentCount = await db.Comments.CountAsync(c => c.PostId == postId) });

        return CreatedAtAction(nameof(GetComments), new { postId }, mapped);
    }

    // POST /api/posts/{postId}/comments/{id}/vote
    [HttpPost("{id}/vote")]
    [Authorize]
    public async Task<IActionResult> VoteComment(int postId, int id, [FromBody] VoteCommentRequest req)
    {
        var comment = await db.Comments.FindAsync(id);
        if (comment is null || comment.PostId != postId) return NotFound();

        comment.Votes += req.Direction.ToLower() == "up" ? 1 : -1;
        await db.SaveChangesAsync();

        return Ok(new { commentId = id, votes = comment.Votes });
    }

    private static object MapComment(Comment c, bool includeReplies) => new
    {
        id = c.Id.ToString(),
        author = c.AuthorUsername,
        content = c.Content,
        votes = c.Votes,
        createdAt = FormatDate(c.CreatedAt),
        replies = includeReplies
            ? c.Replies.OrderBy(r => r.CreatedAt).Select(r => MapComment(r, false)).ToList()
            : (object)new List<object>()
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

    public record AddCommentRequest(string Content, int? ParentCommentId);
    public record VoteCommentRequest(string Direction);
}
