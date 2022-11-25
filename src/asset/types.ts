export interface TypeQueries {
  [index: string]: string;
  state: string;
  area: string;
  type: string;
}

export interface TypeFilter {
  key: string;
  name: string;
  list: {
    [index: string]: string;
    INFO: string;
    EXPECT: string;
    ING: string;
    COMPLETE: string;
  }
}

export interface TypeArticle {
  id: number;
  subject: string;
  images: [{
    imageFileName: string;
  }];
  image: {
    imageFileName: string;
  };
  state: string;
  area: {
    id: number
  };
  type: string;
  desc: React.ReactElement;
}

export interface TypeArticleProps {
  id: number;
  subject: string;
  imageFileName: string;
  state: string;
  area: number;
  type: string;
  children: React.ReactElement;
}

export type TypeContent = any;
