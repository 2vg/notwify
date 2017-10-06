'use strict';

const fs = require('fs'),
　　　　　ipcRenderer = require('electron').ipcRenderer,
　　　　　path = require('path'),
　　　　　login = document.querySelector('#login-form');

login.addEventListener('cancel', (event) => {
    event.preventDefault();
});

function twlogin(via, username, password) {
  const account = {
    'via': via,
    'username': username,
    'password': password
  };
  
  ipcRenderer.send('login', account);
  ipcRenderer.once('reply', (event, arg) => {
    if(arg) {
      alert("ログインに成功しました。");
      ipcRenderer.send('isAuth', isExistFile('./token.json'));
      window.close();
    }else{
      alert("ログインできませんでした。\nユーザーネーム、またはパスワードを確認してもう一度やり直してください。\n※認証制限やネットワークエラーの可能性もあります。");
      showLoginForm();
    }
  })
}

function showLoginForm() {
  return new Promise((resolve, reject) => {
    login.showModal();
    function onClose(event) {
      login.removeEventListener('close', onClose);
      if (login.returnValue === 'ok') {
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
        const via = document.querySelector('#via').value;
        twlogin(via, username, password);
      } else {
        reject(false);
      }
    }
    login.addEventListener('close', onClose, {once: true});
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