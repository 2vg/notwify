'use strict'

const tx = require('twxauth'),
      fs = require('fs'),
      twit = require('twit'),
      path = require('path'),
      url = require('url'),
      electron = require('electron'),
      {app, BrowserWindow, ipcMain, Tray, Menu} = electron,

      consumerKey = "3nVuSoBZnx6U4vzUxf5w",
      consumerSecret = "Bcs59EFbbsdF6Sl9Ng71smgStWEGwXXKSjYvPVt7qys";

let win,
    credentials,
    tray = null;

function createWindow () {
  const size = electron.screen.getPrimaryDisplay().size;
  
  win = new BrowserWindow({
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      devTools: false
    }
  })

  win.setIgnoreMouseEvents(true);
  win.maximize();
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null;
  })
  
  tray = new Tray('./icon-twi.png');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: "終了", click: () => { app.quit(); } }
  ]);
  
  tray.setToolTip(app.getName());
  tray.setContextMenu(contextMenu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})

ipcMain.on('isAuth', (event, arg) => {
  if(arg) {
    event.sender.send('reply', true);
    
    const data = fs.readFileSync('token.json', 'utf8');
    credentials = JSON.parse(data);
    
    stream(
      credentials.consumerKey,
      credentials.consumerSecret,
      credentials.AccessToken,
      credentials.AccessTokenSecret
    );
  }else{
    event.sender.send('reply', false);
  }
})

ipcMain.on('login', async(event, arg) => {
  if(arg !== null) {
    let bool;
    
    switch(arg.via) {
      case 'iPhone':
        bool = await XAuth(
          "IQKbtAYlXLripLGPWd0HUA",
          "GgDYlkSvaPxGxC4X8liwpUoqKwwr3lCADbz8A7ADU",
          arg.username,
          arg.password
        );
        break;
      case 'Android':
        bool = await XAuth(
          "3nVuSoBZnx6U4vzUxf5w",
          "Bcs59EFbbsdF6Sl9Ng71smgStWEGwXXKSjYvPVt7qys",
          arg.username,
          arg.password
        );
        break;
      case 'iPad':
        bool = await XAuth(
          "CjulERsDeqhhjSme66ECg",
          "IQWdVyqFxghAtURHGeGiWAsmCAGmdW3WmbEx6Hck",
          arg.username,
          arg.password
        );
        break;
      case 'Windows':
        bool = await XAuth(
          "TgHNMa7WZE7Cxi1JbkAMQ",
          "SHy9mBMBPNj3Y17et9BF4g5XeqS4y3vkeW24PttDcY",
          arg.username,
          arg.password
        );
        break;
      case 'Mac':
        bool = await XAuth(
          "3rJOl1ODzm9yZy63FACdg",
          "5jPoQ5kQvMJFDYRNE8bQ4rHuds4xJqhvgNJM4awaE8",
          arg.username,
          arg.password
        );
        break;
    }
    
    if(bool){
      event.sender.send('reply', true);
    }else{
      event.sender.send('reply', false);
    }
  }else{
    event.sender.send('reply', false);
  }
})

function stream(ck, cs, at, as) {
  const T = new twit({
    consumer_key: ck,
    consumer_secret: cs,
    access_token: at,
    access_token_secret: as
  });
  
  let stream = T.stream('user');
  
  stream.on('tweet', (tw) => {
    let text = `<br>${tw.text}<br><br>`;
    let name = tw.user.name;
    let screen_name = "@" + tw.user.screen_name;
    let url = tw.user.profile_image_url_https;
    
    if(tw.extended_entities) {
      for(const media_url of tw.extended_entities.media) {
        text += `<span><img src="${media_url.media_url}" width="90" height="90"></img> </span> `;
      }
    }
    
    win.webContents.send('tweets', {
      'text': text,
      'name': `${name}: ${screen_name}`,
      'url': url
    });
  });
}

async function XAuth(ck, cs, un, pw) {
  credentials = await tx.twxauth(ck, cs, un, pw);
  
  if(credentials !== false && credentials !== null) {
    fs.writeFileSync('token.json', JSON.stringify({
      'consumerKey': ck,
      'consumerSecret': cs,
      'AccessToken': credentials.accessToken,
      'AccessTokenSecret': credentials.accessTokenSecret
    }));
    return true;
  }else{
    return false;
  }
};