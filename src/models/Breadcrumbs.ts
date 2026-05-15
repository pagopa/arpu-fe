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
  subHeader?: boolean;
  backButton?: boolean;
  backButtonIcon?: 'exit' | 'back';
  backButtonText?: string;
  backButtonFunction?: () => void;
  titleKey?: string;
  gutters?: boolean;
}
