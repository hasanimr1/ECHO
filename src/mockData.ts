import { Post } from "./types";

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Why Echo's minimalism is the next big thing in social media",
    content: "Echo is designed to strip away all the noise and distractions of modern social platforms. We focus on what matters: the content and the community. No ads, no tracking, just pure interaction.",
    author: "design_guru",
    votes: 4200,
    commentCount: 156,
    category: "minimalism",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "How to build ecstatic UIs using motion and clean accents",
    content: "Building ecstatic interfaces isn't about adding more, it's about making what's there feel alive. Subtle rotations on hover, responsive vote buttons, and a tight typography grid can make a huge difference in how the user feels about your app.",
    author: "framer_maniac",
    votes: 1250,
    commentCount: 89,
    category: "webdev",
    createdAt: "5 hours ago",
  },
  {
    id: "3",
    title: "The hidden beauty of anonymous communities",
    content: "When everyone is anonymous, the focus shifts entirely from the person to the idea. It's a refreshing change from the ego-driven landscapes of other social networks.",
    author: "monk_mode",
    votes: 890,
    commentCount: 45,
    category: "philosophy",
    createdAt: "8 hours ago",
  },
  {
    id: "4",
    title: "A simple recipe for the perfect workspace setup",
    content: "1. Natural light from the side.\n2. One monitor, high refresh rate.\n3. Mechanical keyboard with linear switches.\n4. No clutter on the desk.\n5. Echo open in one tab.",
    author: "productivity_pro",
    votes: 3400,
    commentCount: 231,
    category: "setup",
    createdAt: "12 hours ago",
  }
];
