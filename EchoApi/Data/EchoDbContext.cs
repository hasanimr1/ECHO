using Microsoft.EntityFrameworkCore;
using EchoApi.Models;

namespace EchoApi.Data;

public class EchoDbContext(DbContextOptions<EchoDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique username
        modelBuilder.Entity<AppUser>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // One vote per user per post
        modelBuilder.Entity<Vote>()
            .HasIndex(v => new { v.PostId, v.VoterUsername })
            .IsUnique();

        // Post → Author (no cascade delete to avoid cycles)
        modelBuilder.Entity<Post>()
            .HasOne(p => p.Author)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorUsername)
            .HasPrincipalKey(u => u.Username)
            .OnDelete(DeleteBehavior.Restrict);

        // Comment → Post
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        // Comment → Author
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorUsername)
            .HasPrincipalKey(u => u.Username)
            .OnDelete(DeleteBehavior.Restrict);

        // Comment → ParentComment (self-referencing)
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Vote → Post
        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Post)
            .WithMany(p => p.Votes)
            .HasForeignKey(v => v.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        // Vote → Voter
        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Voter)
            .WithMany(u => u.Votes)
            .HasForeignKey(v => v.VoterUsername)
            .HasPrincipalKey(u => u.Username)
            .OnDelete(DeleteBehavior.Restrict);

        // Store enum as string for readability in the DB
        modelBuilder.Entity<Vote>()
            .Property(v => v.Direction)
            .HasConversion<string>();

        modelBuilder.Entity<Notification>()
            .Property(n => n.Type)
            .HasConversion<string>();
    }
}
