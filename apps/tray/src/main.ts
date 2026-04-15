import { app, Menu, Tray, BrowserWindow, nativeImage, globalShortcut, ipcMain } from 'electron';
import * as path from 'node:path';
import { TaskStore, BoxId } from './tasks-db';

let tray: Tray | null = null;
let popup: BrowserWindow | null = null;
const store = new TaskStore(path.join(app.getPath('userData'), 'tasks.json'));

function buildMenu(): Menu {
  const boxes: { id: BoxId; label: string }[] = [
    { id: 'pc', label: 'PC資産管理' },
    { id: 'mlp', label: 'ドコモMLP' },
    { id: 'compliance', label: 'コンプライアンス' },
    { id: 'infra', label: 'インフラ統合' },
    { id: 'contracts', label: '契約・請求' },
    { id: 'dashboard', label: 'ダッシュボード' },
  ];

  return Menu.buildFromTemplate([
    { label: '録音してタスク化…', accelerator: 'CmdOrCtrl+Alt+T', click: () => openPopup() },
    { type: 'separator' },
    ...boxes.map((b) => ({
      label: `${b.label}  (${store.pendingCount(b.id)}件未達)`,
      click: () => openPopup(b.id),
    })),
    { type: 'separator' },
    { label: '今日のサマリーを読み上げ', click: () => store.speakDailySummary() },
    { type: 'separator' },
    { label: '終了', role: 'quit' },
  ]);
}

function openPopup(box?: BoxId) {
  if (popup) {
    popup.show();
    popup.webContents.send('focus-box', box ?? null);
    return;
  }
  popup = new BrowserWindow({
    width: 420,
    height: 520,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  popup.loadFile(path.join(__dirname, '..', 'ui', 'index.html'));
  popup.on('closed', () => (popup = null));
}

app.whenReady().then(() => {
  const icon = nativeImage.createFromNamedImage('NSStatusAvailable', [0, 0, 0]);
  tray = new Tray(icon);
  tray.setToolTip('AI上司 (タスク管理)');
  tray.setContextMenu(buildMenu());

  globalShortcut.register('CommandOrControl+Alt+T', () => openPopup());

  ipcMain.handle('task:add', (_ev, payload) => store.add(payload));
  ipcMain.handle('task:list', (_ev, box: BoxId) => store.list(box));
  ipcMain.handle('task:done', (_ev, id: string) => store.markDone(id));
});

app.on('window-all-closed', (e: Electron.Event) => {
  // トレイ常駐のため終了しない
  e.preventDefault();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
