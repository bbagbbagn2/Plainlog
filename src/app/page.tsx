"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/lib/posts";
import type { Post } from "@/types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  if (posts.length === 0) {
    return <p>작성된 글이 없습니다.</p>; // 글이 없을 때 안내 메시지
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {post.title} - {post.post_tags.map((tag) => tag.tags.name).join(", ")}
        </li>
      ))}
    </ul>
  );
}
