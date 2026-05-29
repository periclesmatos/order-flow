import { CategoryEmptyNameError } from "../errors/category.errors";

export interface CategoryProps {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCategoryProps = {
  name: string;
}

export class Category {
  private readonly _props: CategoryProps;

  private constructor(props: CategoryProps) {
    this._props = props;
  }

  static create(props: CreateCategoryProps): Category {
    return new Category({
      ...props,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: CategoryProps): Category {
    return new Category({
      ...props,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  get id(): string {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  set name(value: string) {
    if (!value?.trim()) throw new CategoryEmptyNameError();
    this._props.name = value.trim();
    this._props.updatedAt = new Date();
  }

  activate(): void {
    this._props.isActive = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.isActive = false;
    this._props.updatedAt = new Date();
  }

  toJSON(): CategoryProps {
    return {
      id: this._props.id,
      name: this._props.name,
      isActive: this._props.isActive,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }
}
