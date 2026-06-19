namespace EchoApi.Models;

public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Votes { get; set; } = 0;
    public int? ParentCommentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Post? Post { get; set; }
    public AppUser? Author { get; set; }
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = [];
}
