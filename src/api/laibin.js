import request from '@/utils/request'

export function wxAccountList(data) {
  return request({
    url: '/authpage/list',
    method: 'get',
    data: {
      keyword: data.keyword, parentAccount: data.parentAccount, pageSize: data.pageSize,
      pageNum: data.pageNum, dateType: data.dateType, sortType: data.sortType
    }
  })
}

export function wxUserList(data) {
  return request({
    url: '/wxuser/list',
    method: 'get',
    data: {
      pageSize: data.pageSize,
      pageNum: data.pageNum
    }
  })
}

export function newsList(data) {
  return request({
    url: '/news/list',
    method: 'POST',
    data: data
  })
}

export function saveToWechat(data) {
  return request({
    url: '/wxuser/saveToWechat',
    method: 'POST',
    data: data
  })
}

export function newsOriginalList(data) {
  const queryParams = new URLSearchParams({
    keyword: data.keyword !== null ? data.keyword : '',
    pageSize: data.pageSize,
    pageNum: data.pageNum,
    status: data.status,
    categoryId: data.categoryId !== null ? data.categoryId : '',
  });

  return request({
    url: `/news_original/list`,
    method: 'POST',
    data,
  });
}

export function newsCategoryList(data) {
  return request({
    url: `/news_category/listAll`,
    method: 'get',
  });
}


export function bindGzh(){
  return request({
    url: `/authpage/componentinfo`,
    method: 'get',
  });
}

export function getGzhLoginQrcode(appId){
  return request({
    url: `/wxuser/getGzhLoginQrcode?appId=`+appId,
    method: 'get',
  });
}
