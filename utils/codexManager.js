export function addCodex(entry){
  const list=JSON.parse(localStorage.getItem("echoes_codex")||"[]");
  list.push({...entry,timestamp:Date.now()});
  localStorage.setItem("echoes_codex",JSON.stringify(list));
}
