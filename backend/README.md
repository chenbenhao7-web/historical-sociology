# My Website Backend

这是一个基于Express和MongoDB的后端服务器项目。

## 项目结构

```
backend/
  ├── src/
  │   └── server.js    # 主服务器文件
  ├── .env             # 环境变量配置
  ├── package.json     # 项目配置和依赖
  └── README.md        # 项目说明文档
```

## 环境要求

- Node.js (v14+)
- MongoDB

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
复制.env.example文件为.env，并根据需要修改配置。

3. 启动服务器：
```bash
npm start
```

开发模式启动（支持热重载）：
```bash
npm run dev
```

## API接口

### 用户认证

- POST /api/register - 用户注册
- POST /api/login - 用户登录
- GET /api/protected - 受保护的资源（需要认证）

## 安全说明

- 使用bcrypt进行密码加密
- JWT用于用户认证
- 所有敏感信息都通过环境变量配置