namespace EchoApi.Models;

public enum VoteDirection { Up, Down }

public class Vote
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string VoterUsername { get; set; } = string.Empty;
    public VoteDirection Direction { get; set; }

    // Navigation
    public Post? Post { get; set; }
    public AppUser? Voter { get; set; }
}
