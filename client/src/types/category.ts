// src/types/category.ts
import { ReactElement } from "react";

export interface CategoryItem {
  id: string | number;
  name: string;
  image: string;
  icon?: ReactElement; // Only valid JSX elements (not strings/fragments)
  description?: string;
  href: string;
}