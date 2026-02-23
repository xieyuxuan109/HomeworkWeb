package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/router"
)

func main() {
	cfg := configs.Load()
	gin.SetMode(cfg.GIN_MODE)

	var err error
	for i := 1; i <= 10; i++ {
		err = configs.InitDB(cfg)
		if err == nil {
			break
		}
		log.Printf("数据库连接失败，第 %d 次重试: %v", i, err)
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Fatal("数据库连接失败，服务退出: ", err)
	}

	r := router.SetupRouter()
	addr := "0.0.0.0:" + cfg.APP_PORT
	log.Println("服务器启动在", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal("启动失败:", err)
	}
}
