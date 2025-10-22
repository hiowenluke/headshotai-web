// TypeScript 中导入 .vue 文件的全局声明
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}