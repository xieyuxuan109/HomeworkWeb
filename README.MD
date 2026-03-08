### 作业管理系统
#### 这里主要有作业管理系统的前端和后端代码
```
git clone https://github.com/xieyuxuan109/HomeworkWeb.git
cd HomeworkWeb/docker
git clone https://github.com/xieyuxuan109/HomeworkWeb.git
docker build -t 192.168.1.221:81/xieyuxuan/homeworksystem:v2.0.0 .
docker build -f dockerfile2 -t 192.168.1.221:81/xieyuxuan/nginxvue:v1.0.0 .
cp .env.example .env
```