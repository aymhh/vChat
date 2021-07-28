const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        accountProfile: resolve(__dirname, 'accountProfile.html'),
        loginPage: resolve(__dirname, 'loginPage.html'),
        profilePage: resolve(__dirname, 'profilePage.html'),
        rooms: resolve(__dirname, 'rooms.html'),
        signUpPage: resolve(__dirname, 'signUpPage.html')
      }
    }
  }
}
