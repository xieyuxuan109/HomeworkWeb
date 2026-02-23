package service

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/dao"
	"github.com/xieyuxuan109/homeworksystem/model"
)

func CreateHomework(req model.PostHomework, id uint) (*model.HomeworkResponse, error) {
	subject := req.Subject
	if subject == "" {
		subject = req.Department
	}
	if model.GetSubjectLabel(subject) == "" {
		return nil, errors.New("学科不合法")
	}
	homework := model.Homework{
		CreatorID:   id,
		Title:       req.Title,
		Description: req.Description,
		Subject:     subject,
		Deadline:    req.Deadline,
		AllowLate:   req.AllowLate,
	}
	err := dao.AddHW(homework)
	if err != nil {
		return nil, err
	}
	homeworkExists, err := dao.SearchHomework(homework.Title)
	if err != nil {
		return nil, err
	}
	return homeworkExists.ToResponse(), nil

}

func GetHomework(id []uint, subject string, offset int, page int, pageSize int) ([]map[string]interface{}, int64, error) {
	var total int64
	var homeworks []model.Homework
	common := configs.DB.Model(&model.Homework{}).Where("creator_id in (?)", id)
	if subject != "" && subject != "all" {
		common = common.Where("subject = ?", subject)
	}
	query := common.Preload("Creator").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&homeworks)
	result := query.Count(&total)
	if err := result.Error; err != nil {
		return nil, 0, err
	}
	results := make([]map[string]interface{}, len(homeworks))
	for i, v := range homeworks {
		creatorInfo := gin.H{
			"id":       v.Creator.ID,
			"nickname": v.Creator.Nickname,
		}
		sub, err := dao.SearchSubByHW(v.ID)
		if err != nil {
			return nil, 0, err
		}
		results[i] = map[string]interface{}{
			"id":               v.ID,
			"title":            v.Title,
			"description":      v.Description,
			"subject":          v.Subject,
			"subject_label":    model.GetSubjectLabel(v.Subject),
			"department":       v.Subject,
			"department_label": model.GetSubjectLabel(v.Subject),
			"creator":          creatorInfo,
			"deadline":         v.Deadline,
			"allow_late":       v.AllowLate,
			"submission_count": sub.SubmissionCount,
		}
	}
	return results, total, nil
}

func UpdateHomework(req model.UpdateHomework, id uint) (*model.Homework, error) {
	err := dao.UpdateHomework(req, id)
	if err != nil {
		return nil, err
	}
	res, err := dao.SearchHomework(req.Title)
	if err != nil {
		return nil, err
	}
	return res, nil
}
