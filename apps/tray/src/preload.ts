import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('aiBoss', {
  addTask: (payload: unknown) => ipcRenderer.invoke('task:add', payload),
  listTasks: (box: string) => ipcRenderer.invoke('task:list', box),
  markDone: (id: string) => ipcRenderer.invoke('task:done', id),
  onFocusBox: (cb: (box: string | null) => void) =>
    ipcRenderer.on('focus-box', (_ev, box) => cb(box)),
});
