package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/dao"
	"github.com/xieyuxuan109/homeworksystem/model"
	"github.com/xieyuxuan109/homeworksystem/pkg"
)

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			pkg.BadResponse(c, "未识别用户角色", nil)
			c.Abort()
			return
		}
		allowed := false
		for _, role := range allowedRoles {
			if userRole == role {
				allowed = true
				break
			}
		}
		if !allowed {
			pkg.BadResponse(c, "权限不足", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}

// 仅允许作业发布者操作作业
func RequireHomeworkCreator() gin.HandlerFunc {
	return func(c *gin.Context) {
		teacherID := c.GetUint("user_id")
		homeworkID := c.Param("id")
		if homeworkID == "" {
			pkg.BadResponse(c, "作业ID不能为空", nil)
			c.Abort()
			return
		}
		var hw model.Homework
		if err := configs.DB.First(&hw, homeworkID).Error; err != nil {
			pkg.BadResponse(c, "查询作业失败", err)
			c.Abort()
			return
		}
		if hw.CreatorID != teacherID {
			pkg.BadResponse(c, "仅能操作自己发布的作业", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}

// 仅允许老师批改自己绑定学生的提交，且禁止改动其他老师已批改记录
func RequireTeacherStudentSubmission() gin.HandlerFunc {
	return func(c *gin.Context) {
		teacherID := c.GetUint("user_id")
		submissionID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			pkg.BadResponse(c, "提交ID不合法", err)
			c.Abort()
			return
		}
		var submission model.Submission
		if err := configs.DB.First(&submission, submissionID).Error; err != nil {
			pkg.BadResponse(c, "查询提交失败", err)
			c.Abort()
			return
		}
		if submission.ReviewerID != 0 && submission.ReviewerID != teacherID {
			pkg.BadResponse(c, "该提交已由其他老师批改", nil)
			c.Abort()
			return
		}
		if !dao.IsTeacherStudentRelated(teacherID, submission.StudentID) {
			pkg.BadResponse(c, "仅能批改自己学生的提交", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}
