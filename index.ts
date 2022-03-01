// 从 JS 导入的配置项
declare const RGB_ALIVE: u32;
declare const RGB_DEAD: u32;
declare const ROT_SPEED: u32;
declare function log(msg: u32): void;  // 调试用

var width: i32, height: i32, offset: i32;

/** 获取 [0, s] 中指定像素（输入）颜色. */
function get(x: u32, y: u32): u32 {
  return load<u32>((y * width + x) << 2);
}

/** 设置 [s, 2*s] 中指定像素（输出）的颜色 */
function set(x: u32, y: u32, v: u32): void {
  store<u32>((offset + y * width + x) << 2, v);
}

/** 衰败函数，设置 [s, 2*s] 指定像素（输出）颜色逐渐褪色. */
function rot(x: u32, y: u32, v: u32): void {
  var alpha = max<i32>((v >> 24) - ROT_SPEED, 0);
  set(x, y, (alpha << 24) | (v & 0x00ffffff));
}

/** 初始化 */
export function init(w: i32, h: i32): void {
  width  = w;
  height = h;
  offset = w * h;

  // 随机分配细胞
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      let c = Math.random() > 0.1  // 初始化第一帧会布满 1 比 9 的生存/死亡细胞
        ? RGB_DEAD
        : RGB_ALIVE;
      set(x, y, c | 0xff000000);  // 通过 “| 0xff000000” 转为无符号 32 位信息
    }
  }
}


export function step(): void {
  var w = width,
      h = height;

  var hm1 = h - 1,
      wm1 = w - 1;

  // 遍历画布像素
  for (let y = 0; y < h; ++y) {
    let ym1 = y == 0 ? hm1 : y - 1,
        yp1 = y == hm1 ? 0 : y + 1;
    for (let x = 0; x < w; ++x) {
      let xm1 = x == 0 ? wm1 : x - 1,
          xp1 = x == wm1 ? 0 : x + 1;

      // 每个细胞周围会有 8 个相邻细胞，计算存活的邻居细胞数量
      let aliveNeighbors = (
        (get(xm1, ym1) & 1) + (get(x, ym1) & 1) + (get(xp1, ym1) & 1) +
        (get(xm1, y  ) & 1)                     + (get(xp1, y  ) & 1) +
        (get(xm1, yp1) & 1) + (get(x, yp1) & 1) + (get(xp1, yp1) & 1)
      );

      let self = get(x, y);
      if (self & 1) {  // 当前细胞存活中（色值最后一位是否为 1）
        // 周围有 2-3 个存活细胞时，当前细胞开始衰败
        if (aliveNeighbors == 2 || aliveNeighbors == 3) rot(x, y, self);
        // 其它情况细胞直接死亡
        else set(x, y, RGB_DEAD | 0xff000000);
      } else {  // 当前细胞已死亡
        // 周围有 3 个存活细胞时，该细胞复活
        if (aliveNeighbors == 3) set(x, y, RGB_ALIVE | 0xff000000);
        // 否则开始衰败
        else rot(x, y, self);
      }
    }
  }
}