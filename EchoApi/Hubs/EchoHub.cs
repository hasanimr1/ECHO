using Microsoft.AspNetCore.SignalR;

namespace EchoApi.Hubs;

public class EchoHub : Hub
{
    // Clients call this to join a post-specific group (for comment events)
    public async Task JoinPost(string postId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"post-{postId}");
    }

    public async Task LeavePost(string postId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"post-{postId}");
    }
}
