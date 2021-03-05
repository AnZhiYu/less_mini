Page({
  data: {
    avatarUrl: "./user-unlogin.png",
  },
  onLoad() {
    console.log("index這是首頁");
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              });
            },
          });
        }
      },
    });
  },
  onGetUserInfo: function (e) {
    console.log("这是我的信息");
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      });
    }
  },
  onShareAppMessage(options) {
    console.log("option", options);
    return {
      title: "卡夫卡之旅",
      path: `/pages/index/index`,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      },
    };
  },
});
