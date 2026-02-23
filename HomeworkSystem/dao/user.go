package dao

import (
	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/model"
)

func Add(user model.User) error {
	query := configs.DB
	result := query.Create(&user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func Search(username string) (*model.User, error) {
	var user model.User
	query := configs.DB
	err := query.Where("username=?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func UserExist(username string) bool {
	var count int64
	configs.DB.Table("users").
		Where("username = ? ", username).
		Count(&count)
	return count > 0
}

func ExistsUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := configs.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func IsTeacherStudentRelated(teacherID, studentID uint) bool {
	var count int64
	configs.DB.Model(&model.TeacherStudent{}).
		Where("teacher_id = ? AND student_id = ?", teacherID, studentID).
		Count(&count)
	return count > 0
}
