/// <reference types="vite/client" />

// 自定义环境变量类型定义（方案 B）
export interface ImportMetaEnv {
	readonly DEV: boolean;
	readonly MODE: string;
	// 在此添加其他环境变量，例如：readonly VITE_API_BASE?: string;
}
export interface ImportMeta {
	readonly env: ImportMetaEnv;
}
