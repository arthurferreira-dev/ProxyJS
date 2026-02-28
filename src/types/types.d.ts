export declare function reactive(target: object): any;
export declare function effect(fn: () => void): void;
export declare function computed(fn: () => any): () => any;

export declare function newState<T>(initial: T): [() => T, (value: T) => void];
export declare function newEffect(fn: () => (() => void) | void): void;
export declare function newMemo<T>(fn: () => T): () => T;
export declare function newRef<T = HTMLElement>(initialValue?: T | null): { current: T | null };

export declare function createRoot(container: string | Element): { render(component: Function): void };
export declare function renderToRoot(component: Function, container: string | Element): void;
export declare function registerComponent(name: string, component: Function): void;
export declare function createStyle(css: string): Record<string, string>;

export declare function createRouter(routes: { path: string; component: (props: { params: Record<string, string> }) => any }[]): Function;
export declare function navigate(path: string): void;
export declare function newNavigate(): (path: string) => void;
export declare function currentPath(): string;

export declare function createElement(type: any, props?: object, ...children: any[]): any;
export declare const Fragment: symbol;

export declare const html: Record<string, (...args: any[]) => any>;
export declare function ErrorBoundary(props: { fallback?: (err: Error) => any; children: any[] }): any;

declare const ProxyJS: {
  fragment: (...children: any[]) => any;
};
export default ProxyJS;