namespace EchoApi.Models;

public enum NotificationType { Comment, Upvote, Downvote }

public class Notification
{
    public int Id { get; set; }
    public string TargetUsername { get; set; } = string.Empty;
    public string ActorUsername { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public int PostId { get; set; }
    public string PostTitle { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
