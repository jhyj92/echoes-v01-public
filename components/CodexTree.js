// components/CodexTree.js
"use client";

import { useState } from "react";

export default function CodexTree({ tree }) {
  return (
    <ul style={{ listStyle:"none", paddingLeft:0 }}>
      {tree.map((node,i)=>
        <TreeNode key={i} node={node} />
      )}
    </ul>
  );
}

function TreeNode({ node }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <div onClick={()=>setOpen(o=>!o)} style={{ cursor:"pointer" }}>
        {node.title}
      </div>
      {open && node.children?.length>0 && (
        <CodexTree tree={node.children} />
      )}
    </li>
  );
}
