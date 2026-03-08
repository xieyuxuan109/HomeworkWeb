package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/xieyuxuan109/homeworksystem/model"
	"github.com/xieyuxuan109/homeworksystem/pkg"
	"github.com/xieyuxuan109/homeworksystem/service"
)

func SubmitHomework(c *gin.Context) {
	var req model.SubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.BadResponse(c, "传参错误", err)
		return
	}
	id, exists := c.Get("user_id")
	if !exists {
		pkg.BadResponse(c, "请先登录", nil)
		return
	}
	department, exists := c.Get("department")
	if !exists {
		pkg.BadResponse(c, "请先登录", nil)
		return
	}
	res, err := service.SubmitHomework(req, department.(string), id.(uint))
	if err != nil {
		pkg.BadResponse(c, "提交失败", err)
		return
	}
	pkg.GoodResponse(c, "提交成功", res)
}
func SubmitHomeworkList(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	if pageSize > 100 {
		pageSize = 100
	}
	offset := (page - 1) * pageSize
	id, exists := c.Get("user_id")
	if !exists {
		pkg.BadResponse(c, "请先登录", nil)
		return
	}
	res, total, err := service.SubmitHomeworkList(id.(uint), pageSize, offset)
	responese := gin.H{
		"list":      res,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}
	pkg.GoodResponse(c, "success", responese)
}

func MarkExcellent(c *gin.Context) {
	id := c.Param("id")
	UserID, _ := strconv.Atoi(id)
	var req model.Excellent
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.BadResponse(c, "参数错误", err)
		return
	}
	res, err := service.MarkExcellent(req, uint(UserID))
	if err != nil {
		pkg.BadResponse(c, "标记失败", err)
		return
	}
	pkg.GoodResponse(c, "标记成功", res)
}

func CorrectHomework(c *gin.Context) {
	id := c.Param("id")
	UserID, _ := strconv.Atoi(id)
	var req model.CorrectHomework
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.BadResponse(c, "参数错误", err)
		return
	}
	res, err := service.CorrectHomework(req, uint(UserID))
	if err != nil {
		pkg.BadResponse(c, "标记失败", err)
		return
	}
	pkg.GoodResponse(c, "标记成功", res)
}
func ExcellentHomeworks(c *gin.Context) {
	department, _ := c.Get("department")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")
	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)
	offset := pageSize * (page - 1)
	res, err := service.ExcellentHomeworks(department.(string), offset, page, pageSize)
	if err != nil {
		pkg.BadResponse(c, "返回失败", err)
		return
	}
	pkg.GoodResponse(c, "success", res)
}

func GetSubmissions(c *gin.Context) {
	submissions := c.DefaultQuery("submissions", "all") //三种情况，所有作业all，未完成作业not_finish，已完成作业finished
	tag := c.DefaultQuery("tag", "")
	sortName := c.DefaultQuery("sortName", "id")
	sort := c.DefaultQuery("sort", "DESC")
	department, _ := c.Get("department")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	if pageSize > 100 {
		pageSize = 100
	}
	offset := (page - 1) * pageSize
	results, err := service.GetSubmissions(tag, submissions, sort, sortName, department.(string), offset, page, pageSize)
	if err != nil {
		pkg.BadResponse(c, "获取失败", err)
		return
	}
	pkg.GoodResponse(c, "获取成功", results)
}
