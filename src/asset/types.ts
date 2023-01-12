export type TypeQueries = {
  [index: string]: string;
  state: string;
  area: string;
  type: string;
}

export type TypeFilter = {
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

export type TypeArea = {
  id: number;
  name: string;
}

export type TypeImages = {
  id: number;
  imageFileName: string;
}

export type TypeArticle = {
  id: number;
  subject: string;
  images: Array<TypeImages>;
  image: TypeImages;
  state: string;
  area: TypeArea;
  type: string;
  desc: React.ReactElement;
  newContent: boolean;
  updateContent: boolean;
  openDate: string;
}

export type TypeContent = {
  dateMoveIn?: string;
  announcementDate?: string;
  area?: TypeArea;
  content?: string;
  contractEndDate?: string;
  contractStartDate?: string;
  gonggoDate?: string;
  houseSchedule?: boolean;
  id: number;
  images?: Array<TypeImages>;
  information?: boolean;
  latlng?: string;
  nomal1Date?: string;
  nomal2Date?: string;
  openDate?: string;
  specialDate?: string;
  state?: string;
  subject?: string;
  type?: string;
  url?: string;
  youtube?: string;
  resultImages?: Array<TypeImages>;
};
