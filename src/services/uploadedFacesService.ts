export interface UploadedFaceMeta {
	url: string;
	createdAt: number;
}

export interface UploadedFacesResponse {
	faces: UploadedFaceMeta[];
}

interface ApiFaceItem {
	url?: string;
	created_at?: number;
}

interface SessionFacesResponse {
	authenticated?: boolean;
	faces_all?: ApiFaceItem[];
	faces?: ApiFaceItem[]; // fallback for legacy payloads
	error?: string;
	message?: string;
}

import { apiFetch } from '@/utils/api';

export async function fetchAllUploadedFaces(): Promise<UploadedFacesResponse> {
	const res = await apiFetch('/api/auth/session?faces=all', {
		method: 'GET',
		credentials: 'include'
	});

	if (!res.ok) {
		const message = await safeParseError(res);
		throw new Error(message || 'Unable to load uploaded faces.');
	}

	const data = await res.json() as SessionFacesResponse;

	if (!data.authenticated) {
		throw new Error(data?.error || data?.message || 'not_authenticated');
	}

	if (Array.isArray(data.faces_all)) {
		return { faces: normaliseFaces(data.faces_all) };
	}

	if (Array.isArray(data.faces)) {
		return { faces: normaliseFaces(data.faces) };
	}

	// 向后兼容：如果新格式数据缺失，尝试使用旧版端点
	return fetchAllUploadedFacesLegacy();
}

function normaliseFaces(items: ApiFaceItem[]): UploadedFaceMeta[] {
	return items
		.filter((item): item is Required<ApiFaceItem> => Boolean(item?.url && item?.created_at))
		.map((item) => ({
			url: item.url!,
			createdAt: Number(item.created_at)
		}));
}

async function fetchAllUploadedFacesLegacy(): Promise<UploadedFacesResponse> {
	const res = await apiFetch('/api/upload/faces/all', {
		method: 'GET',
		credentials: 'include'
	});

	if (!res.ok) {
		const message = await safeParseError(res);
		throw new Error(message || 'Unable to load uploaded faces.');
	}

	const data = await res.json() as { faces?: ApiFaceItem[] };
	const faces = Array.isArray(data.faces) ? normaliseFaces(data.faces) : [];
	return { faces };
}

async function safeParseError(res: Response): Promise<string | null> {
	try {
		const body = await res.json();
		if (body?.error) return body.error;
		if (body?.message) return body.message;
	} catch {
		/* ignore */
	}
	return res.status >= 400 ? `${res.status} ${res.statusText}` : null;
}
