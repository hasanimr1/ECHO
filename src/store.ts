/**
 * store.ts
 * Replacing localStorage with direct API calls.
 */
import { apiFetch } from './api';
import { Post, Comment, User } from './types';

export interface EchoNotification {
  id: string;
  type: "comment" | "upvote" | "downvote";
  postId: string;
  postTitle: string;
  commenterUsername: string;
  read: boolean;
  createdAt: string;
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function fetchPosts(filter: string = "feed", category?: string | null): Promise<Post[]> {
  let url = `/posts?filter=${filter.toLowerCase()}`;
  if (category) url += `&category=${category}`;
  return apiFetch<Post[]>(url);
}

export async function createPost(title: string, content: string, category: string): Promise<Post> {
  return apiFetch<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, category })
  });
}

export async function votePost(postId: string, direction: 'up' | 'down'): Promise<{ postId: string, voteScore: number }> {
  return apiFetch<{ postId: string, voteScore: number }>(`/posts/${postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ direction })
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function fetchComments(postId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`);
}

export async function createComment(postId: string, content: string, parentCommentId: string | null = null): Promise<Comment> {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentCommentId })
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<EchoNotification[]> {
  return apiFetch<EchoNotification[]>('/notifications');
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiFetch<{ count: number }>('/notifications/unread-count');
  return res.count;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read', { method: 'POST' });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function updateUserDetails(updatedUser: User): void {
  try {
    localStorage.setItem('echo_user', JSON.stringify(updatedUser)); // Only caching details
  } catch {}
}
