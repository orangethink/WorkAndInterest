//index.js
//获取应用实例
const app = getApp()
const config = require('../../utils/config.js')
const api = require('../../utils/api.js')
Page({
  data: {
    index:0,
    speedofprogress:0,
    fraction:0,
    success:true,
    items: [],
    staet:'',
    have:false,
    paperid:'',
    datastate:false,
    message:'本张试卷您已做完',
    pagedata:'',
    code:1,
    showimg: true,
    parameter:''
  },
  onLoad: function (parameter){
    wx.setNavigationBarTitle({ title: JSON.parse(parameter.data).title })
    this.setData({
      parameter: parameter
    })
    let that = this 
    wx.getStorage({
      key: 'login_key',
      success: (res) => {
        that.getTestQuestions(parameter)
      },
      fail: (res) => {
        let intre = setInterval(() => {
          if (that.data.items.length) {
            clearInterval(intre)
          } else {
            that.getTestQuestions(parameter)
          }
        }, 1000)
      }
    })
    
  },
  onshowimg: function (e) {
    this.setData({
      showimg: false
    })
  },
  onhiddenimg: function () {
    this.setData({
      showimg: true
    })
  },
  ondownloadFile: function (e) {
    let downloadTask = wx.downloadFile({
      url: e.currentTarget.dataset.img,
      success: function (res) {
        if (res.statusCode === 200) {
          let rr = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: rr,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
            },
            fail(res) {
              wx.hideLoading()
              wx.showModal({
                title: '',
                showCancel: false,
                content: '保存失败，请前往右上角>关于>右上角>设置处开启相册权限',
                success: function (res) {
                }
              })
            }
          })
        }
      }
    })
    downloadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: '下载进度 ' + res.progress + '%',
      })
    })
  },
  getTestQuestions: function (parameter){
    api.getTestQuestions(parameter.paperid).then((data) => {
      let tolicarr = []
      for (let i = 0; i < data.data.length; i++) {
        for (let j = 0; j < data.data[i].options.length; j++) {
          if (data.data[i].options[j] !== 0) {
            data.data[i].options[j].state = false
            data.data[i].options[j].value = j + 1
          }
        }
      }
      if (!data.data.length) {
        this.setData({
          datastate: true
        })
      }
      if (data.data === 3) {
        this.setData({
          message: '该试卷已删除',
          code:3
        })
      }
      this.setData({
        items: data.data,
        staet: true,
        paperid: parameter.paperid,
        pagedata: parameter.data
      })
    })
  },
  onback: function () {
    wx.switchTab({
      url: '../index/index',
      success: function () {

      }
    })
  },
  ondeil:function(){
    wx.navigateTo({
      url: '../paperDetails/paperDetails?data=' + this.data.pagedata,
      success: function () {

      }
    })
  },
  radioChange: function (e) {
   
    let index=this.data.index;
    let items=this.data.items;
    for (let i = 0; i < items[index].options.length; i++){
      if (items[index].options[i].state) {
        this.setData({
          ['items[' + index + '].options[' + i + '].class']: ''
        })
        items[index].options[i].state = false;
      }
    }
    for (let i = 0; i < items[index].options.length; i++) {
      if (items[index].options[i].value === Number.parseInt(e.target.id)) {
        items[index].options[i].state = true;
        this.setData({
          ['items[' + index + '].options[' + i + '].class']: 'checked'
        })
      }
    }
    setTimeout(()=>{
      if (index+1 >= this.data.items.length){
        this.setData({
          success:false
        });
        this.setData({
          speedofprogress: (index + 1) / this.data.items.length * 100
        });
      }
      else{
        this.setData({
          items: items,
          index: index + 1,
          speedofprogress: (index + 1) / this.data.items.length * 100
        });
      }
    }, 200)
  },
  onradioclick: function(e){
    let selest = this.data.items[this.data.index].options
    for (let i = 0; i < selest.length;i++){
      if (selest[i].state){
        this.setData({
          index: this.data.index + 1,
        });
        return
      }
    }
    wx.showModal({
      title: '',
      showCancel: false,
      content: '请选择一个选项',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else {
          console.log('用户点击取消')
        }
      }
    })
   
  },
  onbutclick: function(){
    if (this.data.index>0){
      this.setData({
        index: this.data.index - 1
      });
    }
  },
  onsuccess: function(){
    let that = this;
    let items = this.data.items
    let list =[]
    for (let i = 0; i < items.length;i++){
      for (let j = 0; j < items[i].options.length;j++){
        if (items[i].options[j] !== 0 && items[i].options[j].state){
          list.push(j)
        }
      }
    }
    wx.redirectTo({
      url: '../gendertestpaperseccuss/gendertestpaperseccuss?paperid=' + that.data.paperid + '&list=' + list+'&have='+true,
      success: function(){

      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '我分享了一套选择题，快来做做看吧！',
      path: '/pages/gendertestpaper/gendertestpaper?paperid=' + this.data.parameter.paperid + '&data=' + JSON.stringify(this.data.data).replace(/=/img, '08862ca061997a4d').replace(/&/img, '54f19ac2aa52aac5').replace(/\?/img, 'c3fb323a2671125a')
    }
  }
})
