//index.js
const app = getApp();

Page({
  data: {
    avatarUrl: "./user-unlogin.png",
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: "",
    shareImgList: []
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: "../chooseLib/chooseLib",
      });
      return;
    }

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
    this.onQuery()
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      });
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: (res) => {
        console.log("[云函数] [login] user openid: ", res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.navigateTo({
          url: "../userConsole/userConsole",
        });
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
        wx.navigateTo({
          url: "../deployFunctions/deployFunctions",
        });
      },
    });
  },
  // 上传图片
  uploadImg: function () {
    const { userInfo } = this.data;
    // 选择图片
    if (!userInfo.nickName) {
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
    } else {
      this.uploadImg();
    }
  },
  // 上传图片
  uploadImg: function () {
    const { userInfo } = this.data;
    let that = this;
    // 选择图片
    if (!userInfo.nickName) {
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
    }
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        wx.showLoading({
          title: "上传中",
        });

        const filePath = res.tempFilePaths[0];
        // 上传图片
        const cloudPath = `${userInfo.nickName}${new Date().getTime()}_${
          filePath.match(/\.[^.]+?$/)[0]
        }`;
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (res) => {
            console.log("[上传文件] 成功：", res);
            app.globalData.fileID = res.fileID;
            app.globalData.cloudPath = cloudPath;
            app.globalData.imagePath = filePath;

            console.log('app.globalData', app.globalData, that)
            // wx.navigateTo({
            //   url: "../storageConsole/storageConsole",
            // });
            that.onAddImg();
          },
          fail: (e) => {
            console.error("[上传文件] 失败：", e);
            wx.showToast({
              icon: "none",
              title: "上传失败",
            });
          },
          complete: () => {
            wx.hideLoading();
          },
        });
      },
      fail: (e) => {
        console.error(e);
      },
    });
  },

  onQuery: function() {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('shareImg').where({
    }).get({
      success: res => {
        console.log('resimg', res)
        this.setData({
          queryResult: JSON.stringify(res.data, null, 2),
          shareImgList: res.data,
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  onShareAppMessage(options) {
    console.log("option", options);
    return {
      title: "卡夫卡之旅",
      path: `/pages/weRouter/index`,
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

  onAddImg: function () {
    console.log("[数据库] [新增记录] 成功，记录 _id: ");
    const db = wx.cloud.database();
    db.collection("shareImg").add({
      data: {
        ...app.globalData,
        type: 'share'
      },
      success: (res) => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1,
        });
        wx.showToast({
          title: "分享图片成功",
        });
        console.log("[数据库] [新增记录] 成功，记录 _id: ", res._id);
      },
      fail: (err) => {
        wx.showToast({
          icon: "none",
          title: "分享图片失败",
        });
        console.error("[数据库] [新增记录] 失败：", err);
      },
    });
  },
});
