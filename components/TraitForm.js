 // components/TraitForm.js
 "use client";

 import { useState } from "react";
+import styles from "./TraitForm.module.css";

 export default function TraitForm({ onSubmit }) {
   const [input, setInput] = useState("");
   const [draft, setDraft] = useState([]);

   function addTrait() {
@@
   }

   return (
-    <div className="trait-form">
-      <input
+    <div className={styles.wrapper}>
+      <h1 className={styles.headline}>Begin Your Echo</h1>
+      <p className={styles.helper}>Enter 3-6 strengths, passions or qualities</p>
+
+      <input
         value={input}
         onChange={(e) => setInput(e.target.value)}
-        placeholder="Type a strength (enter to add)…"
+        placeholder="Type a trait then press Enter…"
         onKeyDown={(e) => e.key === "Enter" && addTrait()}
-      />
-      <button onClick={addTrait}>Add</button>
+        className={styles.input}
+      />
+      <button onClick={addTrait} className={styles.addBtn}>
+        Add
+      </button>
 
       {!!draft.length && (
-        <>
-          <ul>{draft.map((t) => <li key={t}>{t}</li>)}</ul>
-          <button onClick={() => onSubmit(draft)}>Find My World</button>
-        </>
+        <div className={styles.listBlock}>
+          <ul className={styles.list}>
+            {draft.map((t) => (
+              <li key={t}>{t}</li>
+            ))}
+          </ul>
+          <button onClick={() => onSubmit(draft)} className={styles.discoverBtn}>
+            Discover
+          </button>
+        </div>
       )}
     </div>
   );
 }
