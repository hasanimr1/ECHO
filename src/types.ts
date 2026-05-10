/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface Author {
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  votes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  commentCount: number;
  category: string;
  createdAt: string;
}
