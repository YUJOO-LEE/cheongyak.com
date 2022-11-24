export interface TypeQueries {
  [index: string]: string,
  state: string,
  area: string,
  type: string,
}

export interface TypeFilter {
  key: string;
  name: string;
  list: {
    [index: string]: string,
    INFO: string;
    EXPECT: string;
    ING: string;
    COMPLETE: string;
  }
}

export interface TypeArticle {
  id: number,
  subject: string,
  images: [{
    imageFileName: string,
  }],
  state: string,
  area: {
    id: string
  },
  type: string,
  desc: React.ReactElement
}

export interface TypeContent {
  data: any
}