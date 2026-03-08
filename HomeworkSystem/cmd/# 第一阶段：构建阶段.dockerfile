# 第一阶段：构建阶段
FROM golang:1.25 AS builder
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GOPROXY=https://goproxy.cn,direct
WORKDIR /go
RUN git clone https://github.com/xieyuxuan109/HomeworkWeb.git \
    && cd HomeworkWeb/HomeworkSystem/cmd/ \
    && go build -o homeworkweb main.go

# 第二阶段：运行阶段（极简镜像）
FROM alpine
RUN apk add --no-cache ca-certificates tzdata \
&& cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
&& echo "Asia/Shanghai" > /etc/timezone
WORKDIR /root/
COPY --from=builder /go/homeworkweb
EXPOSE 8080
CMD ["./homeworkweb"]