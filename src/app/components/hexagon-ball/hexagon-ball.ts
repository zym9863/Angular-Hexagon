import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  signal,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Vector2D,
  Ball,
  HexagonEdge,
  HexagonConfig,
  PhysicsConfig,
  CollisionResult,
  RenderConfig
} from '../../interfaces/physics.interface';

@Component({
  selector: 'app-hexagon-ball',
  imports: [FormsModule],
  templateUrl: './hexagon-ball.html',
  styleUrl: './hexagon-ball.scss'
})
export class HexagonBall implements AfterViewInit, OnDestroy {
  // Canvas 引用
  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  // Canvas 上下文
  private ctx!: CanvasRenderingContext2D;

  // 动画循环ID
  private animationId: number = 0;
  private lastTime: number = 0;

  // 游戏状态
  public isPaused = signal(false);
  public canvasWidth = 800;
  public canvasHeight = 600;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // 小球对象
  private ball: Ball = {
    position: { x: 400, y: 300 },
    velocity: { x: 200, y: -100 },
    radius: 16,
    mass: 1,
    restitution: 0.8,
    color: '#ff4757'
  };

  // 六边形配置
  public hexagonConfig: HexagonConfig = {
    centerX: 400,
    centerY: 300,
    radius: 200,
    rotationSpeed: 1.0,
    strokeColor: '#2ed573',
    strokeWidth: 5
  };

  // 物理配置
  public physicsConfig: PhysicsConfig = {
    gravity: 800,
    friction: 0.02,
    airResistance: 0.001,
    timeStep: 1 / 60
  };

  // 渲染配置
  private renderConfig: RenderConfig = {
    backgroundColor: '#000000',
    showTrail: true,
    trailLength: 30,
    trailOpacity: 0.15
  };

  // 六边形边界线数组
  private hexagonEdges: HexagonEdge[] = [];

  // 当前旋转角度
  private currentRotation: number = 0;

  // 轨迹点数组
  private trailPoints: Vector2D[] = [];

  ngAfterViewInit(): void {
    // 只在浏览器环境中初始化Canvas
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanvas();
      this.resetBall();
      this.startAnimation();
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  /**
   * 初始化Canvas画布
   */
  private initializeCanvas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // 设置Canvas样式
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * 开始动画循环
   */
  private startAnimation(): void {
    const animate = (currentTime: number) => {
      if (!this.isPaused()) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
        this.update(deltaTime);
        this.render();
      }
      this.lastTime = currentTime;
      this.animationId = requestAnimationFrame(animate);
    };

    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 停止动画循环
   */
  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * 更新游戏状态
   * @param deltaTime 时间增量
   */
  private update(deltaTime: number): void {
    // 更新六边形旋转角度
    this.currentRotation += this.hexagonConfig.rotationSpeed * deltaTime;

    // 重新计算六边形边界
    this.updateHexagonEdges();

    // 更新小球物理状态
    this.updateBallPhysics(deltaTime);

    // 检测碰撞
    this.handleCollisions();

    // 更新轨迹
    this.updateTrail();
  }

  /**
   * 渲染游戏画面
   */
  private render(): void {
    // 创建背景渐变
    const gradient = this.ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, 0,
      this.canvasWidth / 2, this.canvasHeight / 2, Math.max(this.canvasWidth, this.canvasHeight) / 2
    );
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 添加星空效果
    this.drawStarField();

    // 绘制轨迹
    if (this.renderConfig.showTrail) {
      this.drawTrail();
    }

    // 绘制六边形
    this.drawHexagon();

    // 绘制小球
    this.drawBall();

    // 添加环境光效果
    this.drawAmbientLighting();
  }

  /**
   * 更新六边形边界线
   */
  private updateHexagonEdges(): void {
    this.hexagonEdges = [];
    const { centerX, centerY, radius } = this.hexagonConfig;

    // 计算六边形的六个顶点
    const vertices: Vector2D[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + this.currentRotation;
      vertices.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }

    // 创建六条边
    for (let i = 0; i < 6; i++) {
      const start = vertices[i];
      const end = vertices[(i + 1) % 6];

      // 计算边的法向量
      const edgeVector = { x: end.x - start.x, y: end.y - start.y };
      const normal = this.normalize({ x: -edgeVector.y, y: edgeVector.x });

      this.hexagonEdges.push({ start, end, normal });
    }
  }

  /**
   * 更新小球物理状态
   * @param deltaTime 时间增量
   */
  private updateBallPhysics(deltaTime: number): void {
    const { gravity, airResistance } = this.physicsConfig;

    // 应用重力
    this.ball.velocity.y += gravity * deltaTime;

    // 应用空气阻力
    const speed = this.getLength(this.ball.velocity);
    if (speed > 0) {
      const dragForce = airResistance * speed * speed;
      const dragAcceleration = dragForce / this.ball.mass;
      const dragDirection = this.normalize({
        x: -this.ball.velocity.x,
        y: -this.ball.velocity.y
      });

      this.ball.velocity.x += dragDirection.x * dragAcceleration * deltaTime;
      this.ball.velocity.y += dragDirection.y * dragAcceleration * deltaTime;
    }

    // 更新位置
    this.ball.position.x += this.ball.velocity.x * deltaTime;
    this.ball.position.y += this.ball.velocity.y * deltaTime;
  }

  /**
   * 处理碰撞检测
   */
  private handleCollisions(): void {
    for (const edge of this.hexagonEdges) {
      const collision = this.checkBallEdgeCollision(this.ball, edge);

      if (collision.collided) {
        // 移动小球到正确位置
        this.ball.position.x += collision.normal.x * collision.penetrationDepth;
        this.ball.position.y += collision.normal.y * collision.penetrationDepth;

        // 计算反弹速度
        this.resolveBallEdgeCollision(this.ball, edge, collision);
        break;
      }
    }
  }

  /**
   * 检测小球与边的碰撞
   * @param ball 小球对象
   * @param edge 边对象
   * @returns 碰撞结果
   */
  private checkBallEdgeCollision(ball: Ball, edge: HexagonEdge): CollisionResult {
    // 计算点到线段的最短距离
    const { distance, closestPoint } = this.pointToLineSegmentDistance(ball.position, edge);

    const penetrationDepth = ball.radius - distance;
    const collided = penetrationDepth > 0;

    let normal = { x: 0, y: 0 };
    if (collided) {
      // 计算碰撞法向量
      normal = this.normalize({
        x: ball.position.x - closestPoint.x,
        y: ball.position.y - closestPoint.y
      });
    }

    return {
      collided,
      penetrationDepth,
      contactPoint: closestPoint,
      normal
    };
  }

  /**
   * 处理小球与边的碰撞响应
   * @param ball 小球对象
   * @param edge 边对象
   * @param collision 碰撞信息
   */
  private resolveBallEdgeCollision(ball: Ball, edge: HexagonEdge, collision: CollisionResult): void {
    const { normal } = collision;
    const { restitution, velocity } = ball;
    const { friction } = this.physicsConfig;

    // 计算速度在法向量上的投影
    const velocityDotNormal = velocity.x * normal.x + velocity.y * normal.y;

    // 如果球正在远离表面，不处理碰撞
    if (velocityDotNormal > 0) return;

    // 计算法向速度和切向速度
    const normalVelocity = {
      x: normal.x * velocityDotNormal,
      y: normal.y * velocityDotNormal
    };

    const tangentVelocity = {
      x: velocity.x - normalVelocity.x,
      y: velocity.y - normalVelocity.y
    };

    // 应用恢复系数到法向速度
    const newNormalVelocity = {
      x: -normalVelocity.x * restitution,
      y: -normalVelocity.y * restitution
    };

    // 应用摩擦力到切向速度
    const frictionForce = Math.min(friction, 1);
    const newTangentVelocity = {
      x: tangentVelocity.x * (1 - frictionForce),
      y: tangentVelocity.y * (1 - frictionForce)
    };

    // 组合新的速度
    ball.velocity = {
      x: newNormalVelocity.x + newTangentVelocity.x,
      y: newNormalVelocity.y + newTangentVelocity.y
    };
  }

  /**
   * 计算点到线段的距离
   * @param point 点坐标
   * @param edge 线段
   * @returns 距离和最近点
   */
  private pointToLineSegmentDistance(point: Vector2D, edge: HexagonEdge): { distance: number; closestPoint: Vector2D } {
    const { start, end } = edge;

    // 计算线段向量
    const segmentVector = { x: end.x - start.x, y: end.y - start.y };
    const segmentLength = this.getLength(segmentVector);

    if (segmentLength === 0) {
      // 线段长度为0，返回到起点的距离
      const distance = this.getLength({ x: point.x - start.x, y: point.y - start.y });
      return { distance, closestPoint: start };
    }

    // 计算投影参数
    const pointVector = { x: point.x - start.x, y: point.y - start.y };
    const projection = (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) / (segmentLength * segmentLength);

    // 限制投影参数在[0, 1]范围内
    const clampedProjection = Math.max(0, Math.min(1, projection));

    // 计算最近点
    const closestPoint = {
      x: start.x + clampedProjection * segmentVector.x,
      y: start.y + clampedProjection * segmentVector.y
    };

    // 计算距离
    const distance = this.getLength({ x: point.x - closestPoint.x, y: point.y - closestPoint.y });

    return { distance, closestPoint };
  }

  /**
   * 更新轨迹点
   */
  private updateTrail(): void {
    this.trailPoints.push({ ...this.ball.position });

    // 限制轨迹长度
    if (this.trailPoints.length > this.renderConfig.trailLength) {
      this.trailPoints.shift();
    }
  }

  /**
   * 绘制轨迹
   */
  private drawTrail(): void {
    if (this.trailPoints.length < 2) return;

    // 增强轨迹效果 - 添加渐变和发光
    for (let i = 1; i < this.trailPoints.length; i++) {
      const alpha = (i / this.trailPoints.length) * this.renderConfig.trailOpacity;
      const width = (i / this.trailPoints.length) * 4;
      
      // 外层发光效果
      this.ctx.strokeStyle = `rgba(255, 107, 107, ${alpha * 0.3})`;
      this.ctx.lineWidth = width + 4;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = this.ball.color;
      this.ctx.shadowBlur = 15;

      this.ctx.beginPath();
      this.ctx.moveTo(this.trailPoints[i - 1].x, this.trailPoints[i - 1].y);
      this.ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      this.ctx.stroke();

      // 内层轨迹
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      this.ctx.lineWidth = width;
      this.ctx.shadowBlur = 5;

      this.ctx.beginPath();
      this.ctx.moveTo(this.trailPoints[i - 1].x, this.trailPoints[i - 1].y);
      this.ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      this.ctx.stroke();
    }

    // 重置阴影
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制六边形
   */
  private drawHexagon(): void {
    if (this.hexagonEdges.length === 0) return;

    // 绘制外层发光效果
    this.ctx.strokeStyle = this.hexagonConfig.strokeColor;
    this.ctx.lineWidth = this.hexagonConfig.strokeWidth + 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = 0.3;
    this.ctx.shadowColor = this.hexagonConfig.strokeColor;
    this.ctx.shadowBlur = 20;

    this.ctx.beginPath();
    this.ctx.moveTo(this.hexagonEdges[0].start.x, this.hexagonEdges[0].start.y);

    for (const edge of this.hexagonEdges) {
      this.ctx.lineTo(edge.end.x, edge.end.y);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    // 绘制主要六边形
    this.ctx.globalAlpha = 1;
    this.ctx.strokeStyle = this.hexagonConfig.strokeColor;
    this.ctx.lineWidth = this.hexagonConfig.strokeWidth;
    this.ctx.shadowBlur = 15;

    this.ctx.beginPath();
    this.ctx.moveTo(this.hexagonEdges[0].start.x, this.hexagonEdges[0].start.y);

    for (const edge of this.hexagonEdges) {
      this.ctx.lineTo(edge.end.x, edge.end.y);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    // 绘制内层高光
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.6;
    this.ctx.shadowBlur = 5;

    this.ctx.beginPath();
    this.ctx.moveTo(this.hexagonEdges[0].start.x, this.hexagonEdges[0].start.y);

    for (const edge of this.hexagonEdges) {
      this.ctx.lineTo(edge.end.x, edge.end.y);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    // 重置样式
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制小球
   */
  private drawBall(): void {
    const { position, radius, color } = this.ball;

    // 绘制外层发光效果
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 25;
    this.ctx.globalAlpha = 0.6;

    const outerGradient = this.ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, radius + 15
    );
    outerGradient.addColorStop(0, color);
    outerGradient.addColorStop(0.7, 'rgba(255, 107, 107, 0.2)');
    outerGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = outerGradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius + 15, 0, Math.PI * 2);
    this.ctx.fill();

    // 重置透明度
    this.ctx.globalAlpha = 1;

    // 创建主要小球渐变
    const gradient = this.ctx.createRadialGradient(
      position.x - radius * 0.3,
      position.y - radius * 0.3,
      0,
      position.x,
      position.y,
      radius * 1.2
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(0.7, this.darkenColor(color, 0.2));
    gradient.addColorStop(1, this.darkenColor(color, 0.5));

    // 绘制小球阴影
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 6;

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制高光
    const highlight = this.ctx.createRadialGradient(
      position.x - radius * 0.4,
      position.y - radius * 0.4,
      0,
      position.x - radius * 0.4,
      position.y - radius * 0.4,
      radius * 0.6
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlight.addColorStop(1, 'transparent');

    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.fillStyle = highlight;
    this.ctx.beginPath();
    this.ctx.arc(position.x - radius * 0.3, position.y - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 重置阴影
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * 向量标准化
   * @param vector 输入向量
   * @returns 标准化后的向量
   */
  private normalize(vector: Vector2D): Vector2D {
    const length = this.getLength(vector);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
  }

  /**
   * 获取向量长度
   * @param vector 输入向量
   * @returns 向量长度
   */
  private getLength(vector: Vector2D): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  /**
   * 颜色变暗
   * @param color 原色值
   * @param factor 变暗因子
   * @returns 变暗后的颜色
   */
  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  /**
   * Canvas点击事件处理
   * @param event 点击事件
   */
  public onCanvasClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 设置小球到点击位置
    this.ball.position = { x, y };

    // 给小球一个随机速度
    this.ball.velocity = {
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400
    };

    // 清空轨迹
    this.trailPoints = [];
  }

  /**
   * 重置小球
   */
  public resetBall(): void {
    this.ball.position = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2
    };
    this.ball.velocity = {
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300
    };
    this.trailPoints = [];
  }

  /**
   * 切换暂停状态
   */
  public togglePause(): void {
    this.isPaused.set(!this.isPaused());
  }

  /**
   * 绘制星空背景效果
   */
  private drawStarField(): void {
    const time = Date.now() * 0.0001;
    
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time + i * 0.1) * 200 + this.canvasWidth / 2) % this.canvasWidth;
      const y = (Math.cos(time + i * 0.1) * 150 + this.canvasHeight / 2) % this.canvasHeight;
      const opacity = (Math.sin(time + i * 0.2) + 1) * 0.3;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * 绘制环境光效果
   */
  private drawAmbientLighting(): void {
    // 在六边形中心创建发光效果
    const centerX = this.hexagonConfig.centerX;
    const centerY = this.hexagonConfig.centerY;
    
    const ambientGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, this.hexagonConfig.radius * 0.8
    );
    ambientGradient.addColorStop(0, 'rgba(78, 205, 196, 0.05)');
    ambientGradient.addColorStop(0.5, 'rgba(102, 126, 234, 0.03)');
    ambientGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = ambientGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.hexagonConfig.radius * 0.8, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
