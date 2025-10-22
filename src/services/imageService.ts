import { apiFetch } from '@/utils/api';

export async function fetchImages(page = 0, perPage = 10, category?: string): Promise<string[]> {
  try {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('per_page', String(perPage));
    if (category) q.set('category', category);
    const res = await apiFetch(`/api/images?${q.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.images || [];
  } catch (e) {
    console.warn('fetchImages error', e);
    return [];
  }
}

// 获取 demo faces (基于偏好)
export async function fetchDemoFaces(gender: string, ethnicity: string, limit = 4): Promise<string[]> {
  try {
    const q = new URLSearchParams();
    q.set('gender', gender);
    q.set('ethnicity', ethnicity);
    q.set('limit', String(limit));
  const res = await apiFetch(`/api/demo_faces?${q.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.faces || [];
  } catch (e) {
    console.warn('fetchDemoFaces error', e);
    return [];
  }
}

// 获取分类 demo 图片
export interface DemoHomeResult { images: string[]; hasMore: boolean; total: number; page: number; perPage: number; }
export async function fetchDemoHomeImages(params: { category: string; page?: number; perPage?: number; prefs?: { gender?: string; ethnicity?: string; age?: string; bodySize?: string } }): Promise<DemoHomeResult> {
  const { category, page = 1, perPage = 10, prefs } = params;
  try {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    q.set('page', String(page));
    q.set('per_page', String(perPage));
    if (prefs) {
      if (prefs.gender) q.set('gender', prefs.gender);
      if (prefs.ethnicity) q.set('ethnicity', prefs.ethnicity);
      if (prefs.age) q.set('age', prefs.age);
      if (prefs.bodySize) q.set('body_size', prefs.bodySize);
    }
  const res = await apiFetch(`/api/demo_home?${q.toString()}`);
    if (!res.ok) return { images: [], hasMore: false, total: 0, page, perPage };
    const data = await res.json();
    return {
      images: data.images || [],
      hasMore: !!data.has_more,
      total: data.total ?? (data.images?.length || 0),
      page: data.page || page,
      perPage: data.per_page || perPage,
    };
  } catch (e) {
    console.warn('fetchDemoHomeImages error', e);
    return { images: [], hasMore: false, total: 0, page, perPage };
  }
}

/**
 * 获取选项页面图片（backdrops, hairstyles, outfits, poses）
 * 
 * @param params - 请求参数
 * @param params.type - 选项类型，对应文件夹结构 public/images/demo/options/{type}/
 *   可选值：
 *   - 'backdrops': 背景图片
 *   - 'hairstyles': 发型图片
 *   - 'outfits': 服装图片
 *   - 'poses': 姿势图片
 * 
 * @param params.category - 具体分类名称，对应文件夹结构 public/images/demo/options/{type}/{category}/
 *   格式说明：
 *   - 无子菜单：直接使用菜单项的 name，如 'HOT', 'Short', 'Medium', 'Shirt'
 *   - 有子菜单：使用 '主菜单name/子菜单name' 格式，如 'Office/Luxury', 'Studio/Dark', 'Workplace/Open Space'
 *   
 *   示例：
 *   - type='backdrops', category='HOT' → public/images/demo/options/backdrops/HOT/
 *   - type='hairstyles', category='Short' → public/images/demo/options/hairstyles/Short/
 *   - type='backdrops', category='Office/Luxury' → public/images/demo/options/backdrops/Office/Luxury/
 * 
 * @param params.page - 页码，从 1 开始
 * @param params.perPage - 每页数量
 * 
 * @returns Promise<DemoOptionsResult> - 包含图片列表、分页信息等
 */
export interface DemoOptionsResult { images: string[]; hasMore: boolean; total: number; page: number; perPage: number; }
export async function fetchDemoOptionsImages(params: { type: string; category: string; page?: number; perPage?: number }): Promise<DemoOptionsResult> {
  const { type, category, page = 1, perPage = 50 } = params;
  try {
    const q = new URLSearchParams();
    q.set('type', type);
    if (category) q.set('category', category);
    q.set('page', String(page));
    q.set('per_page', String(perPage));
  const res = await apiFetch(`/api/demo_options?${q.toString()}`);
    if (!res.ok) return { images: [], hasMore: false, total: 0, page, perPage };
    const data = await res.json();
    return {
      images: data.images || [],
      hasMore: !!data.has_more,
      total: data.total ?? (data.images?.length || 0),
      page: data.page || page,
      perPage: data.per_page || perPage,
    };
  } catch (e) {
    console.warn('fetchDemoOptionsImages error', e);
    return { images: [], hasMore: false, total: 0, page, perPage };
  }
}
