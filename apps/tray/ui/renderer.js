// 最小実装 — 録音・文字起こしの実コードは次イテレーションで注入。
// ここでは「ボタン押し→ダミータスクを追加」を確認するスタブ。

const recBtn = document.getElementById('rec');
const listEl = document.getElementById('list');
const boxSel = document.getElementById('box');

let recording = false;

recBtn.addEventListener('click', async () => {
  recording = !recording;
  recBtn.classList.toggle('active', recording);
  recBtn.textContent = recording ? '■ 録音停止 (ダミー)' : '● 録音開始';

  if (!recording) {
    // ダミー: 代わりにサンプルタスクを追加
    await window.aiBoss.addTask({
      box: boxSel.value || 'pc',
      title: '【音声入力サンプル】ここに文字起こし結果が入る',
      source: 'voice',
      transcript: '(未実装)',
    });
    await refresh();
  }
});

boxSel.addEventListener('change', refresh);

async function refresh() {
  const tasks = await window.aiBoss.listTasks(boxSel.value || undefined);
  listEl.innerHTML = '';
  for (const t of tasks) {
    const el = document.createElement('div');
    el.className = 'task';
    el.innerHTML = `
      <div class="title">[${t.status}] ${escapeHtml(t.title)}</div>
      <div class="meta">${t.box} / 期限: ${t.dueDate ?? '—'} / ${t.createdAt.slice(0, 10)}</div>
    `;
    listEl.appendChild(el);
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

refresh();
