package service

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/dao"
	"github.com/xieyuxuan109/homeworksystem/model"
)

var Lock sync.Mutex

func SubmitHomework(req model.SubmissionRequest, subject string, ID uint) (res *model.SubmissionResponse, err error) {
	var homework model.Homework
	var submission model.Submission
	var submissionExist model.Submission
	result := configs.DB.First(&homework, req.HomeworkID)
	if result.Error != nil {
		return nil, result.Error
	}
	if homework.Subject == subject {
		if !dao.IsTeacherStudentRelated(homework.CreatorID, ID) {
			return nil, errors.New("仅可提交自己老师布置的作业")
		}
		isLate := time.Now().After(homework.Deadline)
		submission.IsLate = isLate
		if isLate {
			if homework.AllowLate {
				submission.StudentID = ID
				submission.HomeworkID = req.HomeworkID
				submission.Content = req.Content
				submission.FileURL = req.FileURL
			} else {
				return nil, errors.New("作业截止时间已过且不允许补交")
			}
		} else {
			submission.StudentID = ID
			submission.HomeworkID = req.HomeworkID
			submission.Content = req.Content
			submission.FileURL = req.FileURL
		}
	} else {
		return nil, errors.New("该作业不是所在学科的作业")
	}
	result = configs.DB.Create(&submission)
	if result.Error != nil {
		return nil, result.Error
	}
	result = configs.DB.Where("homework_id=? AND student_id=?", req.HomeworkID, ID).First(&submissionExist)
	if result.Error != nil {
		return nil, result.Error
	}
	res = &model.SubmissionResponse{
		ID:          submissionExist.ID,
		HomeworkID:  submissionExist.HomeworkID,
		IsLate:      submissionExist.IsLate,
		SubmittedAt: submissionExist.UpdatedAt,
	}
	return res, nil
}

func SubmitHomeworkList(ID uint, page int, offset int, homeworkID uint) (res []map[string]interface{}, total int64, err error) {
	var submissions []model.Submission
	res = make([]map[string]interface{}, 0)
	query := configs.DB.Model(&model.Submission{}).Where("student_id=?", ID)
	if homeworkID > 0 {
		query = query.Where("homework_id = ?", homeworkID)
	}
	query.Count(&total)
	result := query.Preload("Homework").Offset(offset).Limit(page).Find(&submissions)

	if result.Error != nil {
		return nil, 0, result.Error
	}
	for _, v := range submissions {
		res = append(res, map[string]interface{}{
			"id": v.ID,
			"homework": gin.H{
				"id":               v.Homework.ID,
				"title":            v.Homework.Title,
				"subject":          v.Homework.Subject,
				"subject_label":    model.GetSubjectLabel(v.Homework.Subject),
				"department":       v.Homework.Subject,
				"department_label": model.GetSubjectLabel(v.Homework.Subject),
			},
			"score":        v.Score,
			"comment":      v.Comment,
			"is_excellent": v.IsExcellent,
			"submitted_at": v.UpdatedAt,
		})
	}
	return res, total, nil
}

func MarkExcellent(req model.Excellent, id uint, teacherID uint) (res gin.H, err error) {
	result := configs.DB.Model(&model.Submission{}).Where("id=?", id).Updates(model.Submission{
		IsExcellent: req.IsExcellent,
		ReviewerID:  teacherID,
	})
	if result.Error != nil {
		return nil, result.Error
	}
	var responese model.Submission
	result = configs.DB.Where("id = ?", id).Find(&responese)
	if result.Error != nil {
		return nil, result.Error
	}
	res = gin.H{
		"id":           responese.ID,
		"is_excellent": responese.IsExcellent,
	}
	return res, nil
}
func CorrectHomework(req model.CorrectHomework, id uint, teacherID uint) (res gin.H, err error) {
	Lock.Lock()
	defer Lock.Unlock()
	now := time.Now()
	result := configs.DB.Model(&model.Submission{}).Where("id=?", id).Updates(model.Submission{
		IsExcellent: req.IsExcellent,
		Score:       req.Score,
		Comment:     req.Comment,
		ReviewerID:  teacherID,
		ReviewedAt:  &now,
	})
	if result.Error != nil {
		return nil, result.Error
	}
	var responese model.Submission
	result = configs.DB.Model(&model.Submission{}).Where("id = ?", id).First(&responese)
	if result.Error != nil {
		return nil, result.Error
	}
	res = gin.H{
		"id":           responese.ID,
		"comment":      responese.Comment,
		"reviewed_at":  responese.ReviewedAt,
		"is_excellent": responese.IsExcellent,
	}
	return res, nil
}

func ExcellentHomeworks(subject string, offset int, page int, pageSize int) (gin.H, error) {
	var submissions []model.Submission
	var total int64

	// 1. 构建查询
	query := configs.DB.Preload("Student").
		Preload("Homework")

	// 2. 按部门筛选（这里筛选的是作业的部门）
	if subject != "" && subject != "all" {
		query = query.Joins("LEFT JOIN homeworks h ON h.id = submissions.homework_id").
			Where("h.subject = ?", subject)
	}

	// 3. 计算总数（分页必须）
	query.Model(&model.Submission{}).Count(&total)

	// 4. 执行查询
	err := query.Order("submissions.created_at DESC").Where("submissions.is_excellent=?", true).
		Offset(offset).
		Limit(pageSize).
		Find(&submissions).Error

	if err != nil {
		return nil, err
	}

	// 5. 构建响应结果（修正字段映射错误）
	results := make([]map[string]interface{}, len(submissions))
	for i, v := range submissions {
		// 检查作业是否存在，避免空指针
		var homeworkInfo map[string]interface{}
		if v.Homework.ID != 0 {
			homeworkInfo = map[string]interface{}{
				"id":         v.Homework.ID,
				"title":      v.Homework.Title,
				"subject":    v.Homework.Subject,
				"department": v.Homework.Subject,
			}
		}

		results[i] = map[string]interface{}{
			"id": v.ID,
			"student": map[string]interface{}{
				"id":               v.StudentID,
				"nickname":         v.Student.Nickname,
				"subject":          v.Student.Subject,
				"subject_label":    model.GetSubjectLabel(v.Student.Subject),
				"department":       v.Student.Subject,
				"department_label": model.GetSubjectLabel(v.Student.Subject),
			},
			"homework":     homeworkInfo, // 添加作业信息
			"content":      v.Content,
			"file_url":     v.FileURL,
			"is_late":      v.IsLate,
			"score":        v.Score,   // 修正：原来是 v.IsLate
			"comment":      v.Comment, // 修正：原来是 v.Score
			"is_excellent": v.IsExcellent,
			"submitted_at": v.CreatedAt, // 通常使用 CreatedAt 作为提交时间
			"reviewed_at":  v.ReviewedAt,
		}
	}

	// 6. 返回分页响应
	response := gin.H{
		"list":      results,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}

	return response, nil
}

func GetSubmissions(tag string, submission string, sort string, sortName string, subject string, teacherID uint, role string, offset int, page int, pageSize int) (gin.H, error) {
	var submissions []model.Submission
	var total int64
	query := configs.DB.Preload("Student").
		Preload("Homework")
	query = query.Joins("LEFT JOIN homeworks h ON h.id = submissions.homework_id")
	if subject != "" {
		query = query.Where("h.subject = ?", subject)
	}
	if role == "teacher" {
		query = query.Joins("INNER JOIN teacher_students ts ON ts.student_id = submissions.student_id AND ts.teacher_id = ?", teacherID)
	}
	if tag == "true" {
		query = query.Where("submissions.is_excellent = ?", true)
	}
	if submission == "not_finish" {
		query = query.Where("submissions.score = ?", 0)
	} else if submission == "finished" {
		query = query.Where("submissions.score != ?", 0)
	}
	// 3. 计算总数（分页必须）
	query.Model(&model.Submission{}).Count(&total)

	// 4. 执行查询
	allowedSortFields := map[string]bool{
		"id":           true,
		"created_at":   true,
		"updated_at":   true,
		"score":        true,
		"is_excellent": true,
	}
	if !allowedSortFields[sortName] {
		sortName = "id"
	}
	sort = strings.ToUpper(sort)
	if sort != "ASC" && sort != "DESC" {
		sort = "DESC"
	}

	err := query.Order(fmt.Sprintf("submissions.%s %s", sortName, sort)).
		Offset(offset).
		Limit(pageSize).
		Find(&submissions).Error

	if err != nil {
		return nil, err
	}

	// 5. 构建响应结果（修正字段映射错误）
	results := make([]map[string]interface{}, len(submissions))
	for i, v := range submissions {
		// 检查作业是否存在，避免空指针
		var homeworkInfo map[string]interface{}
		if v.Homework.ID != 0 {
			homeworkInfo = map[string]interface{}{
				"id":          v.Homework.ID,
				"title":       v.Homework.Title,
				"description": v.Homework.Description,
				"subject":     v.Homework.Subject,
			}
		}

		results[i] = map[string]interface{}{
			"id": v.ID,
			"student": map[string]interface{}{
				"id":               v.StudentID,
				"nickname":         v.Student.Nickname,
				"subject":          v.Student.Subject,
				"subject_label":    model.GetSubjectLabel(v.Student.Subject),
				"department":       v.Student.Subject,
				"department_label": model.GetSubjectLabel(v.Student.Subject),
			},
			"homework":     homeworkInfo, // 添加作业信息
			"content":      v.Content,
			"file_url":     v.FileURL,
			"is_late":      v.IsLate,
			"score":        v.Score,   // 修正：原来是 v.IsLate
			"comment":      v.Comment, // 修正：原来是 v.Score
			"is_excellent": v.IsExcellent,
			"submitted_at": v.CreatedAt, // 通常使用 CreatedAt 作为提交时间
			"reviewed_at":  v.ReviewedAt,
		}
	}

	// 6. 返回分页响应
	response := gin.H{
		"list":      results,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}

	return response, nil
}
