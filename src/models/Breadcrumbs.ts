export interface BreadcrumbPath {
  elements?: BreadcrumbElement[];
  routeName?: string;
}

export interface BreadcrumbElement {
  name: string;
  fontWeight?: number;
  color?: string;
  href?: string;
}

export interface RouteHandleObject {
  crumbs?: BreadcrumbPath;
  sidebar?: boolean;
  subHeadear?: boolean;
  backButton?: boolean;
  backButtonText?: string;
  backButtonFunction?: () => void;
  titleKey?: string;
}
