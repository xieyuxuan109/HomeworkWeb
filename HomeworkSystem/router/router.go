package router

import (
	"github.com/gin-gonic/gin"

	"github.com/xieyuxuan109/homeworksystem/handler"
	"github.com/xieyuxuan109/homeworksystem/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	//公共路由
	//用户注册
	r.POST("/user/register", handler.Register)
	//用户登录
	r.POST("/user/login", handler.Login)
	//刷新token
	r.POST("/user/refresh", handler.RefreshTokens)
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		//需认证即可使用的权限

		//获取用户信息
		auth.GET("/user/profile", handler.GetProfile)
		//注销账号
		auth.DELETE("/user/account", handler.DeleteAccount)
		//获取作业列表
		auth.GET("/homeworks", handler.GetHomeworks)
		//获取作业详情
		auth.GET("/homeworks/:id", handler.GetHomework)
		//老登
		//发布作业
		//建立师生关系
		auth.POST("/teachers/students", middleware.RequireRole("teacher"), handler.SetRelation)
		auth.POST("/homeworks", middleware.RequireRole("teacher"), handler.CreateHomework)
		auth.POST("/submissions/:id/aiReview", middleware.RequireRole("teacher"), handler.AIcomment)
		auth.POST("/submissions/:id/localaiReview", middleware.RequireRole("teacher"), handler.LocalAIcomment)
		hw := auth.Group("")
		hw.Use(middleware.RequireRole("teacher"), middleware.RequireHomeworkCreator())
		{
			//老登+同部门
			//修改作业
			hw.PUT("/homeworks/:id", handler.UpdateHomework)
			// 删除作业
			hw.DELETE("/homeworks/:id", handler.DeleteHomework)

		}
		//获取所有作业所有提交
		auth.GET("/submissions", handler.GetSubmissions)
		//标记优秀
		auth.PUT("/submissions/:id/excellent", middleware.RequireRole("teacher"), middleware.RequireTeacherStudentSubmission(), handler.MarkExcellent)
		//批改作业
		auth.PUT("/submissions/:id/review", middleware.RequireRole("teacher"), middleware.RequireTeacherStudentSubmission(), handler.CorrectHomework)
		//小登
		//提交作业
		auth.POST("/submissions", middleware.RequireRole("student"), handler.SubmitHomework)
		//我的提交列表
		auth.GET("/submissions/my", middleware.RequireRole("student"), handler.SubmitHomeworkList)
		//}
		return r
	}

}
