export const wxRequest = (options) =>
  new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        console.log('wwwww',url, err)
        reject(err);
      },
    });
  });
