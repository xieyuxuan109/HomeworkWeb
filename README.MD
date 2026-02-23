### 作业提交系统
#### 这里主要有作业提交系统的前端和后端代码

## Docker Compose 一键部署（华为云）

1. 准备云主机（建议 2C4G+）并安装 Docker 与 Docker Compose。
2. 在仓库根目录复制环境变量模板：
   ```bash
   cp .env.example .env
   ```
3. 修改 `.env` 中的数据库密码和 `JWT_SECRET`。
4. 启动服务：
   ```bash
   docker compose up -d --build
   ```
5. 访问：
   - 前端：`http://<云服务器IP>`
   - 后端健康检查：`http://<云服务器IP>:8080/healthz`（可通过 `.env` 里的 `BACKEND_PORT` 调整）
