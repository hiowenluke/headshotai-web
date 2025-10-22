import { nextTick } from 'vue';

export const DEFAULT_STYLE_PROPS = [
  'display',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'color',
  'background',
  'backgroundColor',
  'border',
  'borderRadius',
  'boxShadow',
  'gap',
  'justifyContent',
  'alignItems'
] as const;

export type StylePropKey = (typeof DEFAULT_STYLE_PROPS)[number];

export interface SerializeOptions {
  styleProps?: readonly StylePropKey[];
  trimText?: boolean;
  skipZeroRect?: boolean;
}

export interface LayoutCaptureSectionConfig {
  selector?: string;
  selectors?: string;
  multi?: boolean;
  optional?: boolean;
}

export interface LayoutCaptureBranch {
  [key: string]: LayoutCaptureNode;
}

export type LayoutCaptureNode = LayoutCaptureSectionConfig | LayoutCaptureBranch;

export interface LayoutCaptureConfig {
  viewport?: boolean;
  structure: Record<string, LayoutCaptureNode>;
  serializeOptions?: SerializeOptions;
}

export interface LayoutCaptureEmitterOptions {
  assignKey?: string;
  logPrefix?: string;
  maxAttempts?: number;
  retryDelayMs?: number;
  exposeHelperKey?: string;
}

export type CapturedElement = ReturnType<typeof serializeElement>;

export function serializeRect(rect: DOMRect) {
  return {
    top: Number(rect.top.toFixed(2)),
    left: Number(rect.left.toFixed(2)),
    width: Number(rect.width.toFixed(2)),
    height: Number(rect.height.toFixed(2))
  };
}

export function pickStyles(
  style: CSSStyleDeclaration,
  props: readonly StylePropKey[] = DEFAULT_STYLE_PROPS
) {
  const result: Record<string, string> = {};
  props.forEach((prop) => {
    const value = style[prop as StylePropKey];
    if (value && value !== 'auto' && value !== 'normal' && value !== '0px') {
      result[prop] = value;
    }
  });
  return result;
}

export function serializeElement(
  el: Element | null,
  options: SerializeOptions = {}
) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (!rect || (options.skipZeroRect !== false && rect.width === 0 && rect.height === 0)) {
    return null;
  }
  const style = window.getComputedStyle(el as HTMLElement);
  return {
    rect: serializeRect(rect),
    styles: pickStyles(style, options.styleProps ?? DEFAULT_STYLE_PROPS),
    text: options.trimText === false ? el.textContent || '' : (el.textContent || '').trim(),
    classes: Array.from(el.classList)
  };
}

export function serializeElements(
  elements: ArrayLike<Element>,
  options: SerializeOptions = {}
) {
  return Array.from(elements)
    .map((el) => serializeElement(el, options))
    .filter((item): item is NonNullable<ReturnType<typeof serializeElement>> => Boolean(item));
}

function isSectionConfig(value: LayoutCaptureNode): value is LayoutCaptureSectionConfig {
  return typeof value === 'object' && value !== null && (
    'selector' in value || 'selectors' in value || 'multi' in value || 'optional' in value
  );
}

export function captureLayoutTree(
  config: LayoutCaptureConfig
): Record<string, any> | null {
  const options = config.serializeOptions ?? {};

  const traverse = (node: LayoutCaptureNode): any => {
    if (isSectionConfig(node)) {
      if (node.multi) {
        const list = node.selectors
          ? document.querySelectorAll(node.selectors)
          : node.selector
            ? document.querySelectorAll(node.selector)
            : null;
        if (!list || list.length === 0) {
          return node.optional ? [] : null;
        }
        return serializeElements(list, options);
      } else {
        const element = node.selector ? document.querySelector(node.selector) : null;
        const serialized = serializeElement(element, options);
        if (!serialized && !node.optional) {
          return null;
        }
        return serialized;
      }
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(node)) {
      const captured = traverse(value);
      if (captured === null && !isSectionConfig(value)) {
        return null;
      }
      result[key] = captured;
    }
    return result;
  };

  const payload: Record<string, any> = {};
  if (config.viewport) {
    payload.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  for (const [key, group] of Object.entries(config.structure)) {
    const captured = traverse(group);
    if (captured === null) {
      return null;
    }
    payload[key] = captured;
  }

  payload.generatedAt = new Date().toISOString();
  return payload;
}

export function createLayoutEmitter(
  capture: () => Record<string, any> | null,
  options: LayoutCaptureEmitterOptions = {}
) {
  const {
    assignKey = 'LAYOUT_DATA',
    exposeHelperKey = 'exportLayoutData',
    logPrefix = '[LAYOUT_DATA]',
    maxAttempts = 12,
    retryDelayMs = 250
  } = options;

  let attempts = 0;
  let exported = false;

  const emit = async () => {
    if (exported) return;
    attempts += 1;
    await nextTick();
    const data = capture();
    if (data) {
      exported = true;
      try {
        (window as any)[assignKey] = data;
        if (exposeHelperKey) {
          (window as any)[exposeHelperKey] = capture;
        }
      } catch {
        /* ignore */
      }
      try {
        console.log(logPrefix, JSON.stringify(data, null, 2));
      } catch {
        console.log(logPrefix, data);
      }
    } else if (attempts < maxAttempts) {
      setTimeout(() => {
        void emit();
      }, retryDelayMs);
    }
  };

  const reset = () => {
    attempts = 0;
    exported = false;
  };

  return { emit, reset };
}
