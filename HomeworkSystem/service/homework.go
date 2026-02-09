package service

import (
	"github.com/gin-gonic/gin"
	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/dao"
	"github.com/xieyuxuan109/homeworksystem/model"
	"gorm.io/gorm"
)

func CreateHomework(req model.PostHomework, id uint) (*model.HomeworkResponse, error) {
	homework := model.Homework{
		CreatorID:   id,
		Title:       req.Title,
		Description: req.Description,
		Department:  req.Department,
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

func GetHomework(id []uint, department string, offset int, page int, pageSize int) ([]map[string]interface{}, int64, error) {
	var total int64
	var homeworks []model.Homework
	common := configs.DB.Model(&model.Homework{})
	var query *gorm.DB
	switch department {
	case "all":
		query = common.Preload("Creator").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&homeworks)
	case "":
		query = common.Where("creator_id in (?)", id).Preload("Creator").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&homeworks)
	default:
		query = common.Where("department = ?", department).Preload("Creator").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&homeworks)
	}
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
			"department":       v.Department,
			"department_label": model.GetDepartmentLabel(v.Department),
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
