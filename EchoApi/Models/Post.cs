namespace EchoApi.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string AuthorUsername { get; set; } = string.Empty;
    public string Category { get; set; } = "general";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Computed via LINQ — not stored
    public int VoteScore => Votes.Sum(v => v.Direction == VoteDirection.Up ? 1 : -1);
    public int CommentCount => Comments.Count;

    // Navigation
    public AppUser? Author { get; set; }
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Vote> Votes { get; set; } = [];
}
