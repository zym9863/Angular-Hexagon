[English Version](README-EN.md) | [中文版本](README.md)

# Angular Hexagon - Hexagonal Ball Physics Engine

An interactive physics simulation application based on Angular, showcasing the motion effects of small balls within a rotating hexagon.

## ✨ Features

- **Real-time Physics Simulation**: Implements gravity, friction, air resistance and other physical effects
- **Elastic Collision**: Precise collision detection and response between balls and hexagon boundaries
- **Rotating Hexagon**: Hexagon can rotate in real-time, adding dynamic effects
- **Trajectory Display**: Visualize ball motion trajectories
- **Parameter Adjustment**: Support real-time adjustment of physics parameters (gravity, friction, elasticity, etc.)
- **Responsive Design**: Adaptive to different screen sizes
- **Server-side Rendering**: Supports SSR, improving performance and SEO

## 🚀 Technology Stack

- **Framework**: Angular 20.3.1
- **Language**: TypeScript
- **Styling**: SCSS
- **Build Tool**: Angular CLI
- **Server-side Rendering**: Angular SSR

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Running Development Server

```bash
npm start
# or
ng serve
```

The application will start at `http://localhost:4200/`. It will automatically reload when source code is modified.

## 🏗️ Building for Production

```bash
npm run build
# or
ng build
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Running Unit Tests

```bash
npm test
# or
ng test
```

Run unit tests using Karma test runner.

## 🔧 Code Generation

Angular CLI provides powerful code generation tools:

```bash
# Generate new component
ng generate component component-name

# View all available generators
ng generate --help
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── hexagon-ball/          # Main game component
│   │   │   ├── hexagon-ball.html
│   │   │   ├── hexagon-ball.scss
│   │   │   └── hexagon-ball.ts
│   │   ├── ball/                  # Ball related components
│   │   └── hexagon/               # Hexagon related components
│   ├── interfaces/
│   │   └── physics.interface.ts   # Physics engine interface definitions
│   ├── services/                  # Service layer
│   ├── app.config.ts              # Application configuration
│   ├── app.routes.ts              # Route configuration
│   └── app.ts                     # Root component
├── main.ts                        # Application entry point
└── styles.scss                    # Global styles
```

## 🎮 Usage Instructions

1. After starting the application, open `http://localhost:4200/` in your browser
2. Click anywhere on the canvas to reposition the ball
3. Adjust parameters in the right control panel to change physics effects:
   - **Gravity**: Controls ball falling speed
   - **Friction**: Affects resistance during ball movement
   - **Air Resistance**: Simulates air impact on movement
   - **Elasticity Coefficient**: Controls rebound strength after collision
   - **Hexagon Rotation Speed**: Changes hexagon rotation speed

## 🔬 Physics Engine Features

- **Vector Operations**: Complete 2D vector mathematical operations
- **Collision Detection**: Precise collision detection based on Separating Axis Theorem
- **Time Integration**: Uses Verlet integration or Euler integration
- **Energy Conservation**: Reasonable energy loss simulation
- **Boundary Handling**: Precise normal vector calculation for hexagon boundaries

## 📄 License

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## 📚 Additional Resources

- [Angular Official Documentation](https://angular.dev/)
- [Angular CLI Command Reference](https://angular.dev/tools/cli)
- [Physics Engine Development Guide](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection)