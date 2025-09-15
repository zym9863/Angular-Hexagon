[English Version](README-EN.md) | [中文版本](README.md)

# Angular Hexagon - 六边形弹球物理引擎

一个基于 Angular 的交互式物理模拟应用，展示小球在旋转六边形内的运动效果。

## ✨ 功能特性

- **实时物理模拟**: 实现重力、摩擦力、空气阻力等物理效果
- **弹性碰撞**: 小球与六边形边界的精确碰撞检测和响应
- **旋转六边形**: 六边形可实时旋转，增加动态效果
- **轨迹显示**: 可视化小球运动轨迹
- **参数调节**: 支持实时调整物理参数（重力、摩擦、弹性等）
- **响应式设计**: 自适应不同屏幕尺寸
- **服务器端渲染**: 支持 SSR，提升性能和 SEO

## 🚀 技术栈

- **框架**: Angular 20.3.1
- **语言**: TypeScript
- **样式**: SCSS
- **构建工具**: Angular CLI
- **服务器端渲染**: Angular SSR

## 📦 安装依赖

```bash
npm install
```

## 🏃‍♂️ 运行开发服务器

```bash
npm start
# 或
ng serve
```

应用将在 `http://localhost:4200/` 启动。修改源代码后会自动重新加载。

## 🏗️ 构建生产版本

```bash
npm run build
# 或
ng build
```

构建产物将保存在 `dist/` 目录中。

## 🧪 运行单元测试

```bash
npm test
# 或
ng test
```

使用 Karma 测试运行器执行单元测试。

## 🔧 代码生成

Angular CLI 提供了强大的代码生成工具：

```bash
# 生成新组件
ng generate component component-name

# 查看所有可用生成器
ng generate --help
```

## 📁 项目结构

```
src/
├── app/
│   ├── components/
│   │   ├── hexagon-ball/          # 主游戏组件
│   │   │   ├── hexagon-ball.html
│   │   │   ├── hexagon-ball.scss
│   │   │   └── hexagon-ball.ts
│   │   ├── ball/                  # 球体相关组件
│   │   └── hexagon/               # 六边形相关组件
│   ├── interfaces/
│   │   └── physics.interface.ts   # 物理引擎接口定义
│   ├── services/                  # 服务层
│   ├── app.config.ts              # 应用配置
│   ├── app.routes.ts              # 路由配置
│   └── app.ts                     # 根组件
├── main.ts                        # 应用入口
└── styles.scss                    # 全局样式
```

## 🎮 使用说明

1. 启动应用后，在浏览器中打开 `http://localhost:4200/`
2. 点击画布任意位置重新定位小球
3. 调整右侧控制面板的参数来改变物理效果：
   - **重力**: 控制小球下落速度
   - **摩擦力**: 影响小球运动时的阻力
   - **空气阻力**: 模拟空气对运动的影响
   - **弹性系数**: 控制碰撞后的反弹力度
   - **六边形旋转速度**: 改变六边形的旋转速度

## 🔬 物理引擎特性

- **向量运算**: 完整的 2D 向量数学运算
- **碰撞检测**: 基于分离轴定理的精确碰撞检测
- **时间积分**: 使用 Verlet 积分或欧拉积分
- **能量守恒**: 合理的能量损耗模拟
- **边界处理**: 六边形边界的精确法向量计算

## 📄 许可证

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## 📚 更多资源

- [Angular 官方文档](https://angular.dev/)
- [Angular CLI 命令参考](https://angular.dev/tools/cli)
- [物理引擎开发指南](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection)
