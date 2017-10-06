'use strict';

let win;

const fs = require('fs'),
      electron = require('electron'),
      ipcRenderer = electron.ipcRenderer,
      remote = electron.remote,
      mainWindow = remote.getCurrentWindow(),
      BrowserWindow = remote.BrowserWindow,
      path = require('path');

ipcRenderer.on('tweets', (event, args) => {
  toast(args.name, args.text, args.url);
});

function isAuth() {
  ipcRenderer.send('isAuth', isExistFile('./token.json'));
  ipcRenderer.once('reply', (event, arg) => {
    if(arg) {
      console.log("auth already.");
    }else{
      alert("認証情報が存在しません。\nログインしてください。");
      
      const modal = path.join('file://', __dirname, '/login.html');
      
      win = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        resizable: false,
        modal: true
      });
      
      win.loadURL(modal);

      win.on('closed', () => {
        win = null;
      });
      
      win.show();
    }
  })
}
    
function toast(un, text, url) {
  iziToast.show({
    close: false,
    drag: false,
    image: url,
    layout: 2,
    maxWidth: 500,
    message: text,
    position: 'bottomRight',
    theme: 'light',
    title: un,
    transitionIn: 'fadeInLeft',
    transitionOut: 'fadeOut',
  });
}

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}