type u32 = number;
type i32 = number;
declare function load<T>(ptr: u32): T;
declare function store<T>(ptr: u32, value: T): void;
declare function max<T>(a: T, b: T): T;