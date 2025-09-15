// 向量接口定义
export interface Vector2D {
  x: number;
  y: number;
}

// 小球物理属性接口
export interface Ball {
  position: Vector2D;        // 球的位置
  velocity: Vector2D;        // 球的速度向量
  radius: number;            // 球的半径
  mass: number;              // 球的质量
  restitution: number;       // 恢复系数（弹性系数）
  color: string;             // 球的颜色
}

// 六边形边界线接口
export interface HexagonEdge {
  start: Vector2D;           // 边的起点
  end: Vector2D;             // 边的终点
  normal: Vector2D;          // 边的法向量
}

// 六边形配置接口
export interface HexagonConfig {
  centerX: number;           // 六边形中心X坐标
  centerY: number;           // 六边形中心Y坐标
  radius: number;            // 六边形外接圆半径
  rotationSpeed: number;     // 旋转速度（弧度/秒）
  strokeColor: string;       // 边框颜色
  strokeWidth: number;       // 边框宽度
}

// 物理世界配置接口
export interface PhysicsConfig {
  gravity: number;           // 重力加速度
  friction: number;          // 摩擦系数
  airResistance: number;     // 空气阻力系数
  timeStep: number;          // 时间步长
}

// 碰撞检测结果接口
export interface CollisionResult {
  collided: boolean;         // 是否发生碰撞
  penetrationDepth: number;  // 穿透深度
  contactPoint: Vector2D;    // 碰撞点
  normal: Vector2D;          // 碰撞法向量
}

// 渲染配置接口
export interface RenderConfig {
  backgroundColor: string;   // 背景颜色
  showTrail: boolean;        // 是否显示轨迹
  trailLength: number;       // 轨迹长度
  trailOpacity: number;      // 轨迹透明度
}