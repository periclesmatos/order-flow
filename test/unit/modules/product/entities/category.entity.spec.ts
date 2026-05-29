import { Category } from '@src/modules/product/domain/entities/category.entity';
import { CategoryEmptyNameError } from '@src/modules/product/domain/errors/category.errors';
import { createTestCategory, DEFAULT_CATEGORY_NAME } from '../category-test.helpers';

describe('Category', () => {
  const baseCreated = new Date('2024-06-01T10:00:00.000Z');
  const baseUpdated = new Date('2024-06-02T10:00:00.000Z');

  it('create assigns id, isActive true and timestamps', () => {
    const c = createTestCategory();

    expect(c.id).toEqual(expect.any(String));
    expect(c.name).toBe(DEFAULT_CATEGORY_NAME);
    expect(c.isActive).toBe(true);
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.updatedAt).toBeInstanceOf(Date);
  });

  it('restore maps all primitives', () => {
    const c = Category.restore({
      id: 'cat-1',
      name: 'Alimentos',
      isActive: false,
      createdAt: baseCreated,
      updatedAt: baseUpdated,
    });

    expect(c.id).toBe('cat-1');
    expect(c.name).toBe('Alimentos');
    expect(c.isActive).toBe(false);
    expect(c.createdAt).toEqual(baseCreated);
    expect(c.updatedAt).toEqual(baseUpdated);
  });

  describe('name setter', () => {
    it('accepts a valid name', () => {
      const c = createTestCategory();
      c.name = 'Vestuário';
      expect(c.name).toBe('Vestuário');
    });

    it('throws CategoryEmptyNameError for empty string', () => {
      const c = createTestCategory();
      expect(() => { c.name = ''; }).toThrow(CategoryEmptyNameError);
    });

    it('throws CategoryEmptyNameError for whitespace-only string', () => {
      const c = createTestCategory();
      expect(() => { c.name = '   '; }).toThrow(CategoryEmptyNameError);
    });

    it('updates updatedAt when name changes', () => {
      const c = createTestCategory();
      const before = c.updatedAt;
      c.name = 'Novo Nome';
      expect(c.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('activate / deactivate', () => {
    it('deactivate sets isActive to false', () => {
      const c = createTestCategory();
      expect(c.isActive).toBe(true);
      c.deactivate();
      expect(c.isActive).toBe(false);
    });

    it('activate sets isActive to true', () => {
      const c = Category.restore({
        id: 'cat-2',
        name: 'Inativa',
        isActive: false,
        createdAt: baseCreated,
        updatedAt: baseUpdated,
      });
      c.activate();
      expect(c.isActive).toBe(true);
    });

    it('deactivate updates updatedAt', () => {
      const c = createTestCategory();
      const before = c.updatedAt;
      c.deactivate();
      expect(c.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  it('toJSON returns all fields including isActive', () => {
    const c = createTestCategory();
    const json = c.toJSON();

    expect(json).toMatchObject({
      id: expect.any(String),
      name: DEFAULT_CATEGORY_NAME,
      isActive: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
