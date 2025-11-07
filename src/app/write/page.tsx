"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/posts";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    await createPost({
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      content,
      tags: tags.split(",").map((t) => t.trim()),
    });

    router.push("/");
  };

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="태그"
      />
      <button onClick={handleSave}>저장</button>
    </div>
  );
}
