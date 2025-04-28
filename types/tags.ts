export interface Tag {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface TagWithCount extends Tag {
  count: number;
}

export interface TagGroup {
  type: string;
  tags: Tag[];
}

export interface TagSelection {
  tagId: string;
  selected: boolean;
}